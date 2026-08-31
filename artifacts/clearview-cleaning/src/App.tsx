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

/* ─── Logo SVG (inline, matches HTML badge design) ─── */
function LogoBadge({ size = 44 }: { size?: number }) {
  const id = `ccs-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" role="img" aria-label="Clearview Cleaning logo">
      <defs>
        <clipPath id={`clip-${id}`}><circle cx="100" cy="100" r="94" /></clipPath>
        <linearGradient id={`sun-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F3C36B" />
          <stop offset="100%" stopColor="#C97A2E" />
        </linearGradient>
        <linearGradient id={`wave-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2C6187" />
          <stop offset="100%" stopColor="#4C88AC" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="97" fill="#FAF8F4" stroke="#12263F" strokeWidth="1.5" />
      <g clipPath={`url(#clip-${id})`}>
        <rect x="6" y="6" width="188" height="188" fill="#FAF8F4" />
        <circle cx="100" cy="82" r="52" fill={`url(#sun-${id})`} />
        <path d="M6,132 Q35,118 64,132 T122,132 T180,132 T194,128 V200 H6 Z" fill={`url(#wave-${id})`} opacity="0.95" />
        <path d="M6,150 Q35,138 64,150 T122,150 T180,150 T194,146 V200 H6 Z" fill="#215072" opacity="0.9" />
        <path d="M6,168 Q35,158 64,168 T122,168 T180,168 T194,165 V200 H6 Z" fill="#12263F" opacity="0.92" />
      </g>
      <circle cx="100" cy="100" r="94" fill="none" stroke="#12263F" strokeWidth="1" />
      <text x="100" y="112" textAnchor="middle" fontFamily="Playball, cursive" fontSize="34" fill="#C1553F" transform="rotate(-6 100 112)">
        Clearview
      </text>
    </svg>
  );
}

/* ─── Reveal on scroll ─── */
function useReveal() {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = document.querySelectorAll<HTMLElement>('.reveal');
    if (!reduceMotion && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
      );
      els.forEach((el) => io.observe(el));
      return () => io.disconnect();
    } else {
      els.forEach((el) => el.classList.add('is-visible'));
      return undefined;
    }
  }, []);
}

/* ─── Header ─── */
const NAV_LINKS = [
  { href: '#top', label: 'Home' },
  { href: '#about', label: 'About' },
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
            <LogoBadge size={scrolled ? 38 : 46} />
            <span className="brand-word">
              <span className="script">Clearview</span>
              <span className="sub">CLEANING CO.</span>
            </span>
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
      <div
        ref={bgRef}
        className="hero-bg"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      />
      <div className="hero-scrim" />
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

/* ─── About ─── */
function About() {
  return (
    <section className="about" id="about">
      <div className="wrap about-grid">
        <div className="about-text reveal">
          <h2>A decade of keeping Bay Area spaces looking the way they should.</h2>
          <p><strong>Clearview Cleaning Co.</strong> is a local, family-owned business — we've been caring for homes and commercial buildings across the Bay Area since 2011.</p>
          <p>We build every service around the space itself: nothing is a one-size-fits-all routine, and nothing gets rushed. Our crews use professional-grade equipment and eco-conscious supplies chosen for the surfaces we're actually working on.</p>
          <p>From nightly janitorial rounds to deep resets and move-out cleans, we show up on time, do the work with care, and leave the space ready for what's next.</p>
          <p>Call us for a free walkthrough before we ever quote a price.</p>
          <a href="#contact" className="btn btn-solid" style={{ marginTop: '8px' }} data-testid="link-about-quote">Request a Quote</a>
        </div>
        <div className="about-badge-wrap reveal">
          <svg className="waves-bg" viewBox="0 0 200 200" aria-hidden="true">
            <circle cx="100" cy="100" r="98" fill="none" stroke="#4C88AC" strokeWidth="1" strokeDasharray="2 6" />
          </svg>
          <LogoBadge size={260} />
        </div>
      </div>
    </section>
  );
}

/* ─── Services ─── */
const SERVICES = [
  { img: 'https://images.unsplash.com/photo-1627905646269-7f034dcc5738?auto=format&fit=crop&w=800&q=75', alt: 'Cleaner wiping down an office desk', title: 'Recurring Home Care', desc: 'Steady, attentive maintenance for the rooms your family actually lives in.' },
  { img: 'https://images.unsplash.com/photo-1437326300822-01d8f13c024f?auto=format&fit=crop&w=800&q=75', alt: 'Janitor mopping a hard floor', title: 'Floor Care', desc: 'Stripping, waxing, and buffing for hard-surface floors that see heavy foot traffic.' },
  { img: 'https://images.unsplash.com/photo-1482449609509-eae2a7ea42b7?auto=format&fit=crop&w=800&q=75', alt: 'Technician cleaning exterior glass', title: 'Window Cleaning', desc: 'Interior and exterior glass, done streak-free from the lobby door to the top floor.' },
  { img: 'https://images.unsplash.com/photo-1669101602124-f5b78895d91c?auto=format&fit=crop&w=800&q=75', alt: 'Worker mopping a sterile clean room', title: 'Deep Cleans & Resets', desc: 'For the moments that need more than a maintenance visit.' },
  { img: 'https://images.unsplash.com/photo-1716703373229-b0e43de7dd5c?auto=format&fit=crop&w=800&q=75', alt: 'Open-plan office space', title: 'Office & Workplace', desc: 'Full-service care for open-plan floors, private offices, and everything in between.' },
  { img: 'https://images.unsplash.com/photo-1740657254989-42fe9c3b8cce?auto=format&fit=crop&w=800&q=75', alt: 'Cleaner scrubbing a tile floor', title: 'Tile & Grout Cleaning', desc: 'Deep extraction that lifts ground-in dirt without damaging the grout line.' },
  { img: 'https://images.unsplash.com/photo-1686178827149-6d55c72d81df?auto=format&fit=crop&w=800&q=75', alt: 'Vacuuming upholstered office furniture', title: 'Carpet & Upholstery', desc: 'Hot-water extraction for carpet, rugs, and office furniture.' },
  { img: 'https://images.unsplash.com/photo-1580256081112-e49377338b7f?auto=format&fit=crop&w=800&q=75', alt: 'Janitorial supply cart', title: 'Move-in / Move-out', desc: 'A fresh beginning, handled with care and a detailed finish.' },
  { img: 'https://images.unsplash.com/photo-1718152521364-b9655b8a7926?auto=format&fit=crop&w=800&q=75', alt: 'Power washing an outdoor walkway', title: 'Power Washing', desc: 'Pressure washing for entries, walkways, and outdoor areas.' },
];

function Services() {
  return (
    <section className="services" id="services">
      <div className="wrap">
        <div className="section-head reveal">
          <h2>Services</h2>
          <p>You can trust Clearview Cleaning Co.'s years of experience and professionalism — here's the full range of what our crews handle.</p>
        </div>
        <div className="service-grid reveal-group">
          {SERVICES.map((s, i) => (
            <div key={s.title} className="service-card reveal" style={{ '--i': i } as React.CSSProperties} data-testid={`service-card-${i}`}>
              <div className="service-media">
                <img loading="lazy" src={s.img} alt={s.alt} />
              </div>
              <div className="service-accent" />
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Band ─── */
function CtaBand() {
  return (
    <section className="cta-band">
      <div className="wave-top" aria-hidden="true">
        <svg viewBox="0 0 1200 70" preserveAspectRatio="none">
          <path d="M0,35 C150,70 350,0 600,35 C850,70 1050,0 1200,35 L1200,70 L0,70 Z" fill="var(--navy)" />
        </svg>
      </div>
      <div className="wrap cta-inner">
        <p className="cta-quote reveal">&ldquo;We maintain quality services at a price you can afford.&rdquo;</p>
        <p className="cta-attr reveal">— Clearview Cleaning Co. —</p>
        <a href="#contact" className="btn btn-gold reveal" data-testid="link-cta-quote">Request a Quote</a>
        <p className="cta-blurb reveal" style={{ marginTop: '34px' }}>
          Clearview Cleaning Co. is a local, family-owned business. We've been serving the Bay Area for more than a decade.
        </p>
        <div className="cta-info-grid reveal-group">
          {[
            { title: 'Business Hours', content: 'Monday – Friday\n8:00am – 6:00pm' },
            { title: 'Phone & Email', content: '(415) 555-0184\nhello@clearview.co', links: ['tel:+14155550184', 'mailto:hello@clearview.co'] },
            { title: 'Insured & Bonded', content: 'Fully licensed and\nbonded for your peace of mind.' },
            { title: 'Service Area', content: 'San Francisco\nMarin · East Bay' },
          ].map(({ title, content, links }, i) => (
            <div key={title} className="col reveal" style={{ '--i': i } as React.CSSProperties}>
              <h4>{title}</h4>
              {links ? (
                <p>
                  {content.split('\n').map((line, j) => (
                    <span key={j}>{j > 0 && <br />}<a href={links[j] ?? '#'}>{line}</a></span>
                  ))}
                </p>
              ) : (
                <p>{content.split('\n').map((line, j) => <span key={j}>{j > 0 && <br />}{line}</span>)}</p>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="wave-bottom" aria-hidden="true">
        <svg viewBox="0 0 1200 70" preserveAspectRatio="none">
          <path d="M0,35 C150,0 350,70 600,35 C850,0 1050,70 1200,35 L1200,0 L0,0 Z" fill="var(--paper)" />
        </svg>
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
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (name.trim().length < 2) { setError('Please add your name so we know who to reply to.'); return; }
    if (contact.trim().length < 5) { setError('Please add an email or phone number.'); return; }
    if (message.trim().length < 10) { setError('A few more details will help us prepare the right quote.'); return; }
    setError('');
    createQuote.mutate(
      { data: { name: name.trim(), contact: contact.trim(), message: message.trim(), mode: 'residential' } },
      {
        onSuccess: () => { setSuccess(true); setName(''); setContact(''); setMessage(''); },
        onError: () => setError('We could not send that just now. Please try again or call us at (415) 555-0184.'),
      },
    );
  };

  return (
    <form className="quote-form" id="quoteForm" onSubmit={submit} noValidate>
      <div className="form-row">
        <div className="field">
          <label htmlFor="fName">Name</label>
          <input type="text" id="fName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" data-testid="input-quote-name" />
        </div>
        <div className="field">
          <label htmlFor="fPhone">Phone</label>
          <input type="tel" id="fPhone" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="(415) 000-0000" data-testid="input-quote-contact" />
        </div>
      </div>
      <div className="form-row">
        <div className="field full">
          <label htmlFor="fMessage">Tell us about your space</label>
          <textarea id="fMessage" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Home or office, square footage, how often you'd like service..." data-testid="input-quote-message" />
        </div>
      </div>
      {error && <p style={{ color: '#C1553F', fontSize: '13px', marginBottom: '12px' }} role="alert" data-testid="status-quote-error">{error}</p>}
      {success ? (
        <div className="form-success" data-testid="status-quote-success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
          <span>Thanks, {name || 'there'} — we've received your request and will be in touch within one business day.</span>
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
        <div className="reveal">
          <QuoteForm />
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <LogoBadge size={38} />
            <span className="script">Clearview Cleaning Co.</span>
          </div>
          <nav className="footer-nav" aria-label="Footer navigation">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} data-testid={`link-footer-${link.label.toLowerCase()}`}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Clearview Cleaning Co. All rights reserved.</span>
          <span>Licensed &amp; Bonded — Bay Area, CA</span>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page: Home ─── */
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
        <TrustStrip />
        <About />
        <Services />
        <CtaBand />
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
