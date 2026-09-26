import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type FormEvent,
  type ReactNode,
} from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateQuote } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

/* ─── Reveal on scroll ───
   Robust against missed triggers: fires early (positive rootMargin),
   and a safety timer force-reveals anything still hidden so no section
   is ever left permanently blank while scrolling. */
function useReveal() {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = document.querySelectorAll<HTMLElement>('.reveal, .reveal-soft');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '80px 0px 80px 0px' },
    );
    els.forEach((el) => io.observe(el));

    // Safety net: never leave a section invisible for long, regardless of
    // observer edge-cases (fast scroll, resize, late layout, etc.)
    const failSafe = window.setTimeout(() => {
      els.forEach((el) => el.classList.add('is-visible'));
    }, 1800);

    return () => { io.disconnect(); window.clearTimeout(failSafe); };
  }, []);
}

/* ─── Header ─── */
const NAV_LINKS = [
  { href: '#top', label: 'Home' },
  { href: '#why-us', label: 'Why Us' },
  { href: '#services', label: 'Services' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#contact', label: 'Contact' },
];

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => {
    setMobileOpen(false);
    document.body.style.overflow = '';
  };

  const toggleMenu = () => {
    const next = !mobileOpen;
    setMobileOpen(next);
    document.body.style.overflow = next ? 'hidden' : '';
  };

  // smooth scroll with header offset
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
    const handler = (e: Event) => {
      const a = e.currentTarget as HTMLAnchorElement;
      const id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = header.offsetHeight + 10;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    };
    links.forEach((a) => a.addEventListener('click', handler));
    return () => links.forEach((a) => a.removeEventListener('click', handler));
  }, []);

  return (
    <>
      <header ref={headerRef} id="siteHeader" className={`site-header${scrolled ? ' scrolled' : ''}`}>
        <div className="wrap header-row">
          <a href="#top" className="brand" data-testid="link-logo">
            <span className="wordmark">Clearview<span className="wordmark-accent">Cleaning</span>.co</span>
          </a>

          <nav className="primary-nav" aria-label="Primary navigation">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} data-testid={`link-nav-${link.label.toLowerCase()}`}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="header-actions">
            <a href="#contact" className="btn btn-outline-light" data-testid="link-header-quote">
              Request a Quote
            </a>
            <button
              className={`menu-toggle${mobileOpen ? ' open' : ''}`}
              onClick={toggleMenu}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              data-testid="button-mobile-menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay nav */}
      <div className={`mobile-nav-overlay${mobileOpen ? ' open' : ''}`} aria-hidden={!mobileOpen}>
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={closeMenu} data-testid={`link-mobile-${link.label.toLowerCase()}`}>
            {link.label}
          </a>
        ))}
        <a href="#contact" className="btn btn-gold" onClick={closeMenu} data-testid="link-mobile-quote">
          Request a Quote
        </a>
      </div>
    </>
  );
}

/* ─── Hero ─── */
function Hero() {
  const bgRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !bgRef.current || !heroRef.current) return;
    let ticking = false;
    const update = () => {
      const rect = heroRef.current!.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const progress = Math.min(Math.max(-rect.top / rect.height, 0), 1);
        bgRef.current!.style.transform = `scale(1.08) translateY(${progress * 60}px)`;
      }
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { window.requestAnimationFrame(update); ticking = true; } };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="hero" id="top" ref={heroRef}>
      <img
        ref={bgRef as React.RefObject<HTMLImageElement>}
        src="/hero-bg.jpg"
        alt="Professional cleaning crew at work in a spotless Bay Area home"
        className="hero-bg"
        width="1920"
        height="1080"
        fetchPriority="high"
        decoding="async"
      />
      <div className="hero-scrim" />
      <div className="hero-float-badges" aria-hidden="true">
        <div className="hero-float-badge hero-fade-up d3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
          100% Satisfaction Guaranteed
        </div>
        <div className="hero-float-badge hero-fade-up d4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a8 8 0 0116 0v1" /></svg>
          Trusted Professionals
        </div>
      </div>
      <div className="wrap hero-inner">
        <div className="hero-tag hero-fade-up d1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
          </svg>
          Serving the Bay Area since 2011
        </div>
        <h1 className="hero-fade-up d2">
          Professional cleaning<br />done the way it should be.
        </h1>
        <p className="lede hero-fade-up d3">
          Janitorial, home care, and deep cleaning for residences and commercial spaces —
          handled by a local crew that shows up, does the work, and doesn't cut corners.
        </p>
        <svg className="hero-underline hero-fade-up d3" viewBox="0 0 220 14">
          <path d="M2,8 Q30,-2 55,7 T110,7 T165,7 T218,6" />
        </svg>
        <div className="hero-cta-row hero-fade-up d4">
          <a href="#contact" className="btn btn-gold" data-testid="link-hero-quote">Request a Quote</a>
          <a href="#services" className="textlink" data-testid="link-hero-services">See what we clean</a>
        </div>
      </div>
      <div className="scroll-cue" aria-hidden="true">
        <span>SCROLL</span>
        <span className="stick" />
      </div>
    </section>
  );
}

/* ─── Trust strip ─── */
function TrustStrip() {
  return (
    <div className="trust-strip">
      <div className="wrap trust-row">
        {[
          { icon: <path d="M20 6L9 17l-5-5" />, text: 'Fully licensed & bonded' },
          { icon: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />, text: 'Family-owned, Bay Area based' },
          { icon: <path d="M12 2l2.9 6.6L22 9.3l-5 4.9 1.2 7-6.2-3.4L5.8 21 7 14 2 9.3l7.1-.7z" fill="currentColor" />, text: '240+ five-star reviews' },
        ].map(({ icon, text }) => (
          <div key={text} className="trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{icon}</svg>
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Why Choose Us ─── */
const WHY_TILES = [
  { img: '/why-main.jpg', alt: 'Clearview cleaner vacuuming a modern office floor', title: 'Trusted Professionals', desc: 'Background-checked, insured, and skilled cleaners', variant: 'main' },
  { img: '/why-eco.jpg', alt: 'Clearview cleaner using eco-friendly products near office plants', title: 'Eco-Friendly Products', desc: 'Safe for kids, pets, and the planet', variant: 'top' },
  { img: '/why-flex.jpg', alt: 'Clearview cleaner wiping floor-to-ceiling windows', title: 'Flexible Scheduling', desc: 'Weekly, monthly, or one-time cleanings', variant: 'bottom' },
];

function WhyChooseUs() {
  const main = WHY_TILES.find((t) => t.variant === 'main')!;
  const rest = WHY_TILES.filter((t) => t.variant !== 'main');

  return (
    <section className="why-us" id="why-us">
      <div className="wrap">
        <div className="why-head reveal">
          <h2>Why Choose Us?</h2>
          <p>Whether it's your home, office, or rental property, we make sure your space sparkles.</p>
        </div>
        <div className="why-photo-grid reveal">
          <div className="why-tile why-tile-main">
            <img src={main.img} alt={main.alt} loading="lazy" />
            <div className="why-tile-overlay" />
            <div className="why-tile-caption">
              <p className="t">{main.title}</p>
              <p className="d">{main.desc}</p>
            </div>
          </div>
          {rest.map((t) => (
            <div key={t.title} className="why-tile">
              <img src={t.img} alt={t.alt} loading="lazy" />
              <div className="why-tile-overlay" />
              <div className="why-tile-caption">
                <p className="t">{t.title}</p>
                <p className="d">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Services ─── */
const SERVICES = [
  { icon: <path d="M3 11l9-8 9 8M5 10v10h14V10" />, title: 'Home Cleaning', desc: 'Steady, attentive maintenance for the rooms your family actually lives in.' },
  { icon: <><path d="M4 21V4a1 1 0 011-1h9a1 1 0 011 1v17" /><path d="M14 21v-6h6v6" /><path d="M8 7h1M8 11h1M8 15h1" /></>, title: 'Office Cleaning', desc: 'Full-service care for open-plan floors, private offices, and everything between.' },
  { icon: <><path d="M3 6h18" /><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" /><path d="M5 6l1 14a2 2 0 002 2h8a2 2 0 002-2l1-14" /></>, title: 'Deep Cleaning', desc: 'For the moments that need more than a routine maintenance visit.' },
  { icon: <><path d="M2 20h20" /><path d="M4 20V10l8-6 8 6v10" /><path d="M9 20v-6h6v6" /></>, title: 'Post-Construction Cleaning', desc: 'Dust, debris, and residue cleared so a finished space is truly move-in ready.' },
];

function Services() {
  return (
    <section className="services" id="services">
      <div className="wrap">
        <div className="section-head reveal">
          <h2>Our Services</h2>
          <p>You can trust Clearview Cleaning Co.'s years of experience and professionalism — here's the full range of what our crews handle.</p>
        </div>
        <div className="service-grid reveal-group">
          {SERVICES.map((s, i) => (
            <div key={s.title} className="service-card reveal" style={{ '--i': i } as React.CSSProperties} data-testid={`service-card-${i}`}>
              <div className="service-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Team ─── */
const TEAM = [
  { name: 'Jake', role: 'Deep Cleaning Expert', img: '/team-jake.png' },
  { name: 'Tina', role: 'Office Cleaning Coordinator', img: '/team-tina.png' },
  { name: 'Maria', role: 'Residential Cleaning Specialist', img: '/team-maria.png' },
];

function TeamSection() {
  return (
    <section className="team-section" id="team">
      <div className="wrap">
        <div className="section-head reveal">
          <h2>Meet Our Professional Team</h2>
          <p>The crew behind every clean — background-checked, trained, and proud of the work.</p>
        </div>
        <div className="team-grid reveal-group">
          {TEAM.map((m, i) => (
            <div key={m.name} className="team-card reveal" style={{ '--i': i } as React.CSSProperties} data-testid={`team-card-${i}`}>
              <img src={m.img} alt={`${m.name}, ${m.role}`} loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonial carousel ─── */
const REVIEWS = [
  { name: 'Maya & Chris', body: 'The first time we walked back in, we both said the same thing: it feels like our home again. Steady, reliable — exactly what we needed.' },
  { name: 'David R.', body: 'Had our office cleaned last week and was amazed at the result — no shortcuts, no dirt, just clean. They even went above and beyond on common areas.' },
  { name: 'Frank M.', body: "Been with this crew for two seasons now, and each visit has been better than the last. This year's team did an outstanding job on the whole floor." },
  { name: 'Sandra L.', body: 'The crew handled a tremendous job cleaning our windows — very accommodating with our schedule and finished the whole thing in no time.' },
  { name: 'Marcus T.', body: 'Our lobby floors have never looked better. Reliable crew, fair pricing, and they always call ahead before showing up.' },
];

function StarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 1l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L10 14.8 4.4 18l1.4-6.2L1 7.5l6.4-.6z" />
    </svg>
  );
}

function GoogleBadge() {
  return (
    <svg className="g-badge" viewBox="0 0 48 48">
      <path fill="#FBBC05" d="M9.8 24c0-1.6.3-3.1.8-4.5L2.6 13.9A23.9 23.9 0 000 24c0 3.8.9 7.5 2.6 10.6l8-6.2c-.5-1.4-.8-2.9-.8-4.4z" />
      <path fill="#EA4335" d="M24 9.6c3.7 0 6.6 1.3 8.6 3.1l6.6-6.4C35 2.3 30 0 24 0 14.6 0 6.5 5.4 2.6 13.4l8 6.2C12.5 14 17.8 9.6 24 9.6z" />
      <path fill="#34A853" d="M24 38.4c-6.2 0-11.5-4.4-13.4-10l-8 6.2C6.5 42.6 14.6 48 24 48c5.8 0 10.9-1.9 14.9-5.4l-7.3-5.7c-2 1.4-4.6 2.5-7.6 2.5z" />
      <path fill="#4285F4" d="M46.9 24.6c0-1.6-.1-3.1-.4-4.6H24v9h12.9c-.6 3-2.3 5.4-4.8 7.1l7.3 5.7C43.7 38 46.9 32 46.9 24.6z" />
    </svg>
  );
}

function Testimonials() {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const computePerView = () => {
    const w = window.innerWidth;
    if (w <= 760) return 1;
    if (w <= 980) return 2;
    return 4;
  };

  const maxIndex = useCallback(() => Math.max(0, REVIEWS.length - computePerView()), []);

  const goTo = useCallback((i: number) => {
    setIndex(Math.min(Math.max(i, 0), maxIndex()));
  }, [maxIndex]);

  const resetAutoplay = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1 > maxIndex() ? 0 : prev + 1));
    }, 5500);
  }, [maxIndex]);

  useEffect(() => {
    resetAutoplay();
    return () => clearInterval(timerRef.current);
  }, [resetAutoplay]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll<HTMLElement>('.review-card');
    if (!cards.length) return;
    const cardWidth = cards[0].getBoundingClientRect().width;
    track.style.transform = `translateX(-${index * (cardWidth + 24)}px)`;
  }, [index]);

  useEffect(() => {
    const onResize = () => { setIndex(0); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const dots = Array.from({ length: maxIndex() + 1 });

  return (
    <section className="testimonials" id="reviews">
      <div className="wrap">
        <div className="testi-head reveal">
          <h2>What Our Customers Are Saying</h2>
          <p>Over <span className="stat">240 five-star reviews</span> from Bay Area homes and offices. Here's what a few had to say.</p>
        </div>
        <div className="carousel-wrap reveal"
          onMouseEnter={() => clearInterval(timerRef.current)}
          onMouseLeave={() => resetAutoplay()}
        >
          <div className="carousel-viewport">
            <div className="carousel-track" ref={trackRef}>
              {REVIEWS.map((r) => (
                <div key={r.name} className="review-card">
                  <div className="review-top">
                    <div>
                      <div className="review-name">{r.name}</div>
                      <div className="stars">{Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} />)}</div>
                    </div>
                    <GoogleBadge />
                  </div>
                  <p className="review-body">{r.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="carousel-controls">
            <button
              className="carousel-arrow"
              aria-label="Previous reviews"
              onClick={() => { goTo(index - 1 < 0 ? maxIndex() : index - 1); resetAutoplay(); }}
              data-testid="button-carousel-prev"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <div className="carousel-dots">
              {dots.map((_, i) => (
                <button
                  key={i}
                  className={i === index ? 'active' : ''}
                  aria-label={`Go to review set ${i + 1}`}
                  onClick={() => { goTo(i); resetAutoplay(); }}
                  data-testid={`button-carousel-dot-${i}`}
                />
              ))}
            </div>
            <button
              className="carousel-arrow"
              aria-label="Next reviews"
              onClick={() => { goTo(index + 1 > maxIndex() ? 0 : index + 1); resetAutoplay(); }}
              data-testid="button-carousel-next"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Quote Form ─── */
function QuoteForm() {
  const createQuote = useCreateQuote();
  const [mode, setMode] = useState<'residential' | 'commercial'>('residential');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setName(''); setCompany(''); setEmail(''); setPhone(''); setMessage(''); setError('');
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (name.trim().length < 2) { setError('Please add your name so we know who to reply to.'); return; }
    if (mode === 'commercial' && company.trim().length < 2) { setError('Please add your company name.'); return; }
    if (!email.trim().includes('@')) { setError('Please add a valid email address.'); return; }
    if (message.trim().length < 10) { setError('A few more details will help us prepare the right quote.'); return; }
    setError('');

    // Build contact string: always email, append phone if provided
    const contactStr = phone.trim() ? `${email.trim()} | ${phone.trim()}` : email.trim();
    // Prepend company to message for business
    const fullMessage = mode === 'commercial' && company.trim()
      ? `Company: ${company.trim()}\n\n${message.trim()}`
      : message.trim();

    createQuote.mutate(
      { data: { name: name.trim(), contact: contactStr, message: fullMessage, mode } },
      {
        onSuccess: () => { setSuccess(true); resetForm(); },
        onError: () => setError('We could not send that just now. Please try again or call us at (415) 555-0184.'),
      },
    );
  };

  return (
    <form className="quote-form" id="quoteForm" onSubmit={submit} noValidate>
      {/* Mode toggle */}
      <div className="mode-toggle" role="group" aria-label="Service type">
        <button
          type="button"
          className={`mode-btn${mode === 'residential' ? ' active' : ''}`}
          onClick={() => setMode('residential')}
          data-testid="button-quote-residential"
        >
          Home
        </button>
        <button
          type="button"
          className={`mode-btn${mode === 'commercial' ? ' active' : ''}`}
          onClick={() => setMode('commercial')}
          data-testid="button-quote-commercial"
        >
          Business
        </button>
      </div>

      {/* Name + Company (business only) */}
      <div className="form-row">
        <div className="field">
          <label htmlFor="fName">Your name</label>
          <input type="text" id="fName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane or Jordan Lee" data-testid="input-quote-name" />
        </div>
        {mode === 'commercial' ? (
          <div className="field">
            <label htmlFor="fCompany">Company name</label>
            <input type="text" id="fCompany" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Corp." data-testid="input-quote-company" />
          </div>
        ) : (
          <div className="field">
            <label htmlFor="fPhone">
              Phone <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>(optional)</span>
            </label>
            <input type="tel" id="fPhone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(415) 000-0000" data-testid="input-quote-phone" />
          </div>
        )}
      </div>

      {/* Email + Phone (business) */}
      <div className="form-row">
        <div className={`field${mode === 'residential' ? ' full' : ''}`}>
          <label htmlFor="fEmail">Email address</label>
          <input type="email" id="fEmail" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" data-testid="input-quote-email" />
        </div>
        {mode === 'commercial' && (
          <div className="field">
            <label htmlFor="fPhone">
              Phone <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>(optional)</span>
            </label>
            <input type="tel" id="fPhone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(415) 000-0000" data-testid="input-quote-phone" />
          </div>
        )}
      </div>

      {/* Message */}
      <div className="form-row">
        <div className="field full">
          <label htmlFor="fMessage">
            {mode === 'residential' ? 'Tell us about your home' : 'Tell us about your facility'}
          </label>
          <textarea
            id="fMessage"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={mode === 'residential'
              ? "Square footage, rooms, how often you'd like service..."
              : 'Building type, square footage, cleaning schedule needed...'}
            data-testid="input-quote-message"
          />
        </div>
      </div>

      {error && <p style={{ color: '#C1553F', fontSize: '13px', marginBottom: '12px' }} role="alert" data-testid="status-quote-error">{error}</p>}

      {success ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-success" data-testid="status-quote-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
            <span>Thanks, {name || 'there'} — we've received your request and will be in touch within one business day.</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="btn btn-outline-navy"
            data-testid="button-submit-another"
          >
            Send another request
          </button>
        </div>
      ) : (
        <button type="submit" className="btn btn-solid" disabled={createQuote.isPending} data-testid="button-submit-quote">
          {createQuote.isPending ? 'Sending…' : 'Send Request'}
        </button>
      )}
    </form>
  );
}

/* ─── Contact Section ─── */
function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="wrap contact-grid">
        <div className="contact-intro reveal">
          <h2>Request a Quote</h2>
          <p>Tell us a little about your space and we'll get back to you within one business day — or call us directly for a free walkthrough.</p>
          <div className="contact-list">
            {[
              {
                icon: <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.1-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .3 2 .6 3a2 2 0 01-.5 2.1L8 10a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c1 .3 2 .5 3 .6a2 2 0 011.7 2z" />,
                label: 'Phone', value: '(415) 555-0184', href: 'tel:+14155550184',
              },
              {
                icon: <><path d="M4 4h16v16H4z" opacity="0" /><path d="M22 6l-10 7L2 6" /><path d="M2 6h20v12H2z" /></>,
                label: 'Email', value: 'hello@clearview.co', href: 'mailto:hello@clearview.co',
              },
              {
                icon: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
                label: 'Business Hours', value: 'Monday – Friday, 8am – 6pm',
              },
              {
                icon: <><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></>,
                label: 'Service Area', value: 'San Francisco · Marin · East Bay',
              },
            ].map(({ icon, label, value, href }) => (
              <div key={label} className="item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{icon}</svg>
                <div>
                  <div className="label">{label}</div>
                  {href
                    ? <a className="value" href={href} data-testid={`link-contact-${label.toLowerCase()}`}>{value}</a>
                    : <div className="value">{value}</div>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="contact-form-wrap reveal">
          <QuoteForm />
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
const FOOTER_SOCIALS = [
  { label: 'X', href: '#', icon: <path d="M4 4l16 16M20 4L4 20" /> },
  { label: 'LinkedIn', href: '#', icon: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 10v7M7 7v.01M12 17v-4a2 2 0 014 0v4M12 13v4" /></> },
  { label: 'Instagram', href: '#', icon: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></> },
  { label: 'Facebook', href: '#', icon: <path d="M14 9h3V5h-3a4 4 0 00-4 4v2H7v4h3v6h4v-6h3l1-4h-4V9a1 1 0 011-1z" /> },
];

function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-links">
          <div className="footer-col">
            <a href="#top" data-testid="link-footer-home">Home</a>
            <a href="#services" data-testid="link-footer-services">Services</a>
          </div>
          <div className="footer-col">
            <a href="#why-us" data-testid="link-footer-about">About</a>
            <a href="#contact" data-testid="link-footer-contact">Contact</a>
          </div>
        </div>
        <div className="footer-newsletter">
          <p>Join Our Newsletter for big updates</p>
          <form
            className="newsletter-form"
            onSubmit={(e) => e.preventDefault()}
            data-testid="form-newsletter"
          >
            <input type="email" placeholder="Your Email" aria-label="Email address" required data-testid="input-newsletter-email" />
            <button type="submit" data-testid="button-newsletter-submit">Get Started</button>
          </form>
          <div className="footer-socials">
            {FOOTER_SOCIALS.map((s) => (
              <a key={s.label} href={s.href} aria-label={s.label} data-testid={`link-social-${s.label.toLowerCase()}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="footer-giant" aria-hidden="true">
        <span>Clearview<span className="wordmark-accent">Cleaning</span>.co</span>
      </div>
      <div className="wrap footer-bottom">
        <span>© 2026 Clearview Cleaning Co. All rights reserved.</span>
        <span>Licensed &amp; Bonded — Bay Area, CA</span>
      </div>
    </footer>
  );
}

/* ─── Page: Home ─── */
/* ─── Before / After slider ─── */
const BA_PAIRS = [
  {
    label: 'Commercial — before & after janitorial service',
    before: '/ba-commercial-before.jpg',
    after:  '/ba-commercial-after.jpg',
  },
  {
    label: 'Residential — before & after deep clean',
    before: '/ba-residential-before.jpg',
    after:  '/ba-residential-after.jpg',
  },
];

function BeforeAfterSlide({ before, after, label }: { before: string; after: string; label: string }) {
  const [pos, setPos] = useState(50);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const calcPos = useCallback((clientX: number) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 1), 99);
    setPos(pct);
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    calcPos(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    calcPos(e.clientX);
  };

  const onPointerUp = () => { dragging.current = false; };

  return (
    <div
      ref={wrapRef}
      className="ba-wrap"
      style={{ '--ba-pos': `${pos}%` } as React.CSSProperties}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-label={label}
    >
      <img src={after} alt="After cleaning" className="ba-img ba-img-after" draggable={false} />
      <img src={before} alt="Before cleaning" className="ba-img ba-img-before" draggable={false} />
      <span className="ba-label ba-label-before">BEFORE</span>
      <span className="ba-label ba-label-after">AFTER</span>
      <div className="ba-handle" aria-hidden="true">
        <div className="ba-knob">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M8 6l-6 6 6 6M16 6l6 6-6 6" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function BeforeAfterSection() {
  return (
    <section className="ba-section" id="before-after">
      <div className="wrap">
        <div className="section-head reveal">
          <h2>See the difference</h2>
          <p>Drag the handle left or right to compare before and after. This is the standard we hold on every visit.</p>
        </div>
        <div className="ba-grid reveal">
          {BA_PAIRS.map((pair) => (
            <div key={pair.label}>
              <p className="ba-pair-label">{pair.label}</p>
              <BeforeAfterSlide {...pair} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ─── */
type PricingMode = 'residential' | 'commercial';

const PRICING: Record<PricingMode, { name: string; price: number; period: string; badge: string | null; desc: string; features: string[]; cta: string; featured: boolean }[]> = {
  residential: [
    {
      name: 'Fresh Home',
      price: 299,
      period: 'per visit',
      badge: null,
      featured: false,
      desc: 'Perfect for apartments and smaller homes that need a thorough regular clean.',
      features: [
        'Full home clean (up to 2,000 sq ft)',
        'Kitchen & bathrooms deep scrub',
        'Floor mopping & vacuuming',
        'Interior window clean',
        'One-time or monthly schedule',
      ],
      cta: 'Book Fresh Home',
    },
    {
      name: 'Complete Care',
      price: 399,
      period: 'per visit',
      badge: 'Most Popular',
      featured: true,
      desc: 'Our most comprehensive home bundle — interior, exterior, and everything between.',
      features: [
        'Everything in Fresh Home',
        'Deep clean — all rooms',
        'Interior + exterior windows',
        'Carpet & upholstery extraction',
        'Move-in / move-out ready',
        'Priority scheduling',
      ],
      cta: 'Book Complete Care',
    },
  ],
  commercial: [
    {
      name: 'Business Clean',
      price: 399,
      period: 'per service',
      badge: null,
      featured: false,
      desc: 'For small offices and retail spaces that need dependable regular service.',
      features: [
        'Office janitorial (nightly or weekly)',
        'Common areas & break rooms',
        'Restroom deep clean',
        'Trash & recycling service',
        'Floor sweeping & mopping',
      ],
      cta: 'Get Business Quote',
    },
    {
      name: 'Facility Pro',
      price: 549,
      period: 'per service',
      badge: 'Best Value',
      featured: true,
      desc: 'Full-service for larger commercial spaces with a dedicated crew and account manager.',
      features: [
        'Everything in Business Clean',
        'Window cleaning (interior + exterior)',
        'Floor stripping, waxing & buffing',
        'Carpet & tile deep extraction',
        'Janitorial supply restocking',
        'Dedicated account manager',
      ],
      cta: 'Get Facility Quote',
    },
  ],
};

function PricingSection() {
  const [mode, setMode] = useState<PricingMode>('residential');

  return (
    <section className="pricing-section" id="pricing">
      <div className="wrap">
        <div className="pricing-head reveal">
          <p className="pricing-eyebrow">Simple, transparent pricing</p>
          <h2>Pick the plan that fits your space.</h2>
          <p className="pricing-sub">No hidden fees. No vague "starting at" quotes. Adjust any time.</p>

          <div className="pricing-toggle-wrap">
            <div className="pricing-toggle" role="group" aria-label="Choose pricing type">
              <div
                className="pricing-toggle-pill"
                style={{ transform: mode === 'commercial' ? 'translateX(100%)' : 'translateX(0)' }}
              />
              <button
                type="button"
                className={`pricing-toggle-btn${mode === 'residential' ? ' active' : ''}`}
                onClick={() => setMode('residential')}
                data-testid="button-pricing-residential"
              >
                Residential
              </button>
              <button
                type="button"
                className={`pricing-toggle-btn${mode === 'commercial' ? ' active' : ''}`}
                onClick={() => setMode('commercial')}
                data-testid="button-pricing-commercial"
              >
                Commercial
              </button>
            </div>
          </div>
        </div>

        <div key={mode} className="pricing-cards pricing-cards-anim">
          {PRICING[mode].map((plan) => (
            <div key={plan.name} className={`pricing-card${plan.featured ? ' pricing-card-featured' : ''}`}>
              {plan.badge && <span className="pricing-badge">{plan.badge}</span>}
              <p className="pricing-name">{plan.name}</p>
              <p className="pricing-desc">{plan.desc}</p>
              <div className="pricing-price">
                <span className="pricing-currency">$</span>
                <span className="pricing-amount">{plan.price}</span>
                <span className="pricing-period">{plan.period}</span>
              </div>
              <ul className="pricing-features">
                {plan.features.map((f) => (
                  <li key={f}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`btn ${plan.featured ? 'btn-gold' : 'btn-solid'} pricing-cta`}
                data-testid={`link-pricing-${plan.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {plan.cta}
              </a>
              {!plan.featured && (
                <p className="pricing-note">Custom quotes available for larger spaces.</p>
              )}
            </div>
          ))}
        </div>

        <p className="pricing-footer-note reveal">
          All plans include a free walkthrough before we quote. Prices are starting points — your exact quote depends on space size and frequency.
        </p>
      </div>
    </section>
  );
}

function Home() {
  useReveal();

  return (
    <div id="top" className="overflow-hidden">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-[#E3A23B] focus:px-4 focus:py-2 focus:text-sm focus:font-bold">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Services />
        <WhyChooseUs />
        <TeamSection />
        <TrustStrip />
        <BeforeAfterSection />
        <PricingSection />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

/* ─── Router ─── */
function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
