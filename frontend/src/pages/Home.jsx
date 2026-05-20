import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI Interaction States
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFabChip, setActiveFabChip] = useState('Khadi Cotton');

  // Fetch Products
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await productAPI.list({ limit: 4, featured: 1 });
        setFeaturedProducts(res.data?.data || []);
      } catch (err) {
        console.error('Error fetching featured products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // Scroll & Animation Effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      const backTop = document.querySelector('.back-top');
      if (backTop) {
        if (window.scrollY > 400) backTop.classList.add('visible');
        else backTop.classList.remove('visible');
      }
    };
    window.addEventListener('scroll', handleScroll);

    // Escape key listener for overlays
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMenuOpen(false);
        document.body.style.overflow = '';
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Intersection Observer for scroll reveal animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    const targets = document.querySelectorAll('.why-card, .testi-card, .cat-card, .product-card-anim');
    targets.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity .6s ease, transform .6s ease';
      observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('keydown', handleKeyDown);
      observer.disconnect();
    };
  }, [loading]); // Re-run observer when products finish loading

  const toggleSearch = () => {
    const newState = !isSearchOpen;
    setIsSearchOpen(newState);
    document.body.style.overflow = newState ? 'hidden' : '';
  };

  const toggleMenu = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    document.body.style.overflow = newState ? 'hidden' : '';
  };

  const fallbackProducts = [
    { id: 'fb1', name: 'Handloom Kurta Set', fabric: 'Pure Cotton Khadi', price: '1,299', oldPrice: '1,799', icon: '🥻', badge: 'New', colors: ['#F5F0E8', '#1B4332', '#4A2C0A', '#2C1654'] },
    { id: 'fb2', name: 'Khadi Blazer', fabric: 'Linen Blend Khadi', price: '3,499', oldPrice: '4,999', icon: '🧥', badge: 'Sale', colors: ['#2C2C2A', '#1B4332', '#8B7355'] },
    { id: 'fb3', name: 'Silk Khadi Dupatta', fabric: 'Silk-Cotton Blend', price: '899', oldPrice: '1,299', icon: '🧣', badge: 'Trending', colors: ['#C4622D', '#B8860B', '#2C1654', '#1B4332'] },
    { id: 'fb4', name: 'Raw Khadi Thaan', fabric: 'Per Meter · Handspun', price: '280/m', oldPrice: null, icon: '🌿', badge: null, colors: ['#F5F0E8', '#E8DCC8', '#C8B89A'] },
  ];

  return (
    <div className="home-container">
      <style>{`
        /* Global Variables & Resets */
        :root {
          --green: #1B4332; --green-light: #2D6A4F; --green-dark: #0D2A1E;
          --gold: #C5933A; --gold-light: #E2B96F; --gold-pale: #F5E8CC;
          --cream: #F7F2EA; --cream-dark: #EDE3D4; --off-white: #FDFAF6;
          --text: #1A1A18; --text-muted: #5C5C52; --text-light: #8C8C80;
          --border: #D8CFC0; --border-light: #EDE3D4;
          --serif: 'Cormorant Garamond', Georgia, serif;
          --sans: 'Jost', system-ui, sans-serif;
          --display: 'Playfair Display', Georgia, serif;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        .home-container {
          font-family: var(--sans);
          color: var(--text);
          background: var(--off-white);
          overflow-x: hidden;
        }

        /* Navbar */
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          background: rgba(253,250,246,0.94); backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--border-light);
          padding: 0 5%; height: 68px;
          display: flex; align-items: center; justify-content: space-between;
          transition: all .3s;
        }
        nav.scrolled { background: rgba(253,250,246,0.98); box-shadow: 0 2px 20px rgba(0,0,0,0.06); }
        .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .logo-mark { width: 38px; height: 38px; border-radius: 50%; background: var(--green); display: flex; align-items: center; justify-content: center; font-family: var(--serif); font-size: 18px; color: #fff; font-weight: 600; }
        .logo-text { font-family: var(--serif); font-size: 1.25rem; color: var(--green); font-weight: 600; line-height: 1.1; }
        .logo-sub { font-family: var(--sans); font-size: 0.6rem; color: var(--gold); letter-spacing: 2px; text-transform: uppercase; font-weight: 500; }
        .nav-links { display: flex; gap: 28px; list-style: none; }
        .nav-links a { font-size: 0.82rem; letter-spacing: 0.8px; text-transform: uppercase; color: var(--text-muted); text-decoration: none; font-weight: 500; transition: color .2s; position: relative; }
        .nav-links a::after { content: ''; position: absolute; bottom: -3px; left: 0; width: 0; height: 1.5px; background: var(--gold); transition: width .3s; }
        .nav-links a:hover { color: var(--green); }
        .nav-links a:hover::after { width: 100%; }
        .nav-actions { display: flex; align-items: center; gap: 12px; }
        .nav-icon-btn { width: 38px; height: 38px; border: none; background: none; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: background .2s; position: relative; }
        .nav-icon-btn:hover { background: var(--cream-dark); }
        .nav-icon-btn svg { width: 20px; height: 20px; stroke: var(--text); fill: none; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
        .cart-badge { position: absolute; top: 4px; right: 4px; width: 16px; height: 16px; border-radius: 50%; background: var(--gold); color: #fff; font-size: 9px; font-weight: 600; display: flex; align-items: center; justify-content: center; }
        .btn-login { padding: 8px 20px; border: 1.5px solid var(--green); background: none; color: var(--green); font-family: var(--sans); font-size: 0.78rem; letter-spacing: 1px; text-transform: uppercase; font-weight: 500; cursor: pointer; border-radius: 2px; transition: all .25s; }
        .btn-login:hover { background: var(--green); color: #fff; }
        .btn-nav-primary { padding: 8px 20px; border: none; background: var(--gold); color: #fff; font-family: var(--sans); font-size: 0.78rem; letter-spacing: 1px; text-transform: uppercase; font-weight: 500; cursor: pointer; border-radius: 2px; transition: all .25s; }
        .btn-nav-primary:hover { background: var(--green); }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; background: none; border: none; padding: 4px; }
        .hamburger span { width: 22px; height: 1.5px; background: var(--text); display: block; transition: all .3s; }

        /* Hero */
        .hero { min-height: 100vh; padding-top: 68px; display: grid; grid-template-columns: 1fr 1fr; position: relative; overflow: hidden; }
        .hero-left { display: flex; flex-direction: column; justify-content: center; padding: 80px 5% 80px 8%; background: var(--off-white); position: relative; }
        .hero-eyebrow { font-family: var(--sans); font-size: 0.72rem; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); font-weight: 500; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; }
        .hero-eyebrow::before { content: ''; width: 32px; height: 1px; background: var(--gold); }
        .hero-title { font-family: var(--serif); font-size: clamp(2.8rem, 5vw, 4.2rem); line-height: 1.12; color: var(--text); font-weight: 300; margin-bottom: 24px; }
        .hero-title em { font-style: italic; color: var(--green); font-weight: 400; }
        .hero-desc { font-size: 0.95rem; line-height: 1.8; color: var(--text-muted); max-width: 420px; margin-bottom: 36px; font-weight: 300; }
        .hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; }
        .btn-primary { padding: 14px 36px; background: var(--green); color: #fff; border: none; font-family: var(--sans); font-size: 0.8rem; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 500; cursor: pointer; border-radius: 2px; transition: all .3s; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-primary:hover { background: var(--green-dark); transform: translateY(-2px); }
        .btn-outline { padding: 14px 36px; background: none; color: var(--text); border: 1.5px solid var(--border); font-family: var(--sans); font-size: 0.8rem; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 500; cursor: pointer; border-radius: 2px; transition: all .3s; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-outline:hover { border-color: var(--green); color: var(--green); }
        .hero-stats { display: flex; gap: 40px; margin-top: 48px; padding-top: 32px; border-top: 1px solid var(--border-light); }
        .stat-num { font-family: var(--serif); font-size: 2rem; color: var(--green); font-weight: 500; line-height: 1; }
        .stat-label { font-size: 0.72rem; color: var(--text-light); letter-spacing: 1px; text-transform: uppercase; margin-top: 4px; }
        .hero-right { position: relative; background: var(--green); display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .hero-fabric-bg { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(255,255,255,0.04) 8px, rgba(255,255,255,0.04) 9px), repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.04) 8px, rgba(255,255,255,0.04) 9px); }
        .hero-product-card { background: rgba(255,255,255,0.08); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; padding: 28px 32px; text-align: left; color: #fff; min-width: 220px; }
        .hero-card-label { font-size: 0.7rem; letter-spacing: 2px; text-transform: uppercase; color: var(--gold-light); margin-bottom: 8px; }
        .hero-card-title { font-family: var(--serif); font-size: 1.6rem; font-weight: 400; margin-bottom: 4px; }
        .hero-card-price { font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-bottom: 16px; }
        .hero-card-tag { display: inline-block; background: var(--gold); color: #fff; padding: 4px 12px; border-radius: 2px; font-size: 0.7rem; letter-spacing: 1px; text-transform: uppercase; font-weight: 500; }

        /* Marquee */
        .marquee-strip { background: var(--green); color: var(--gold-light); padding: 12px 0; overflow: hidden; white-space: nowrap; }
        .marquee-inner { display: inline-flex; animation: marquee 25s linear infinite; gap: 0; }
        .marquee-item { font-size: 0.72rem; letter-spacing: 2.5px; text-transform: uppercase; font-weight: 500; padding: 0 32px; display: inline-flex; align-items: center; gap: 12px; }
        .marquee-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--gold); flex-shrink: 0; }
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }

        /* Sections General */
        section { padding: 90px 8%; }
        .section-tag { font-size: 0.7rem; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); font-weight: 500; margin-bottom: 14px; display: flex; align-items: center; gap: 12px; }
        .section-tag::before { content: ''; width: 24px; height: 1px; background: var(--gold); }
        .section-title { font-family: var(--serif); font-size: clamp(2rem, 3.5vw, 2.8rem); line-height: 1.2; color: var(--text); font-weight: 400; margin-bottom: 16px; }
        .section-title em { font-style: italic; color: var(--green); }

        /* Categories */
        .categories-section { background: var(--cream); }
        .categories-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 48px; }
        .cat-card { position: relative; border-radius: 6px; overflow: hidden; cursor: pointer; transition: transform .3s; aspect-ratio: 3/4; text-decoration: none; display: block; }
        .cat-card:hover { transform: translateY(-6px); }
        .cat-bg { width: 100%; height: 100%; display: flex; align-items: flex-end; padding: 24px; position: relative; overflow: hidden; }
        .cat-1 .cat-bg { background: linear-gradient(160deg, #2D5016 0%, #1B3A0E 100%); }
        .cat-2 .cat-bg { background: linear-gradient(160deg, #4A2C0A 0%, #2E1A06 100%); }
        .cat-3 .cat-bg { background: linear-gradient(160deg, #1B4332 0%, #0D2A1E 100%); }
        .cat-4 .cat-bg { background: linear-gradient(160deg, #2C1654 0%, #180D30 100%); }
        .cat-pattern { position: absolute; inset: 0; opacity: 0.15; background: repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 1px, transparent 0, transparent 50%); background-size: 20px 20px; }
        .cat-icon { position: absolute; top: 24px; right: 24px; width: 48px; height: 48px; border-radius: 50%; background: rgba(255,255,255,0.12); display: flex; align-items: center; justify-content: center; font-size: 22px; }
        .cat-info { position: relative; z-index: 2; text-align: left; }
        .cat-label { font-size: 0.65rem; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.6); margin-bottom: 6px; }
        .cat-name { font-family: var(--serif); font-size: 1.4rem; color: #fff; font-weight: 400; line-height: 1.2; margin-bottom: 8px; }
        .cat-count { font-size: 0.72rem; color: rgba(255,255,255,0.5); }
        .cat-arrow { width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; margin-top: 16px; transition: all .3s; font-size: 14px; color: rgba(255,255,255,0.7); }
        .cat-card:hover .cat-arrow { background: var(--gold); border-color: var(--gold); color: #fff; }

        /* Featured Products */
        .products-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 48px; }
        .view-all { font-size: 0.78rem; letter-spacing: 1px; text-transform: uppercase; color: var(--green); font-weight: 500; text-decoration: none; display: flex; align-items: center; gap: 8px; transition: gap .2s; }
        .view-all:hover { gap: 14px; }
        .products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .product-card { cursor: pointer; text-decoration: none; display: block; color: inherit; }
        .product-img-wrap { aspect-ratio: 3/4; background: var(--cream); border-radius: 4px; position: relative; overflow: hidden; margin-bottom: 16px; transition: all .3s; }
        .product-card:hover .product-img-wrap { border-radius: 8px; }
        .product-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 60px; background: linear-gradient(135deg, var(--cream) 0%, var(--cream-dark) 100%); }
        .product-badge { position: absolute; top: 12px; left: 12px; background: var(--green); color: #fff; padding: 4px 10px; border-radius: 2px; font-size: 0.65rem; letter-spacing: 1px; text-transform: uppercase; font-weight: 500; }
        .product-badge.new { background: var(--gold); }
        .product-wishlist { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; border-radius: 50%; background: rgba(253,250,246,0.9); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity .2s; font-size: 14px; }
        .product-card:hover .product-wishlist { opacity: 1; }
        .product-quick-add { position: absolute; bottom: 12px; left: 12px; right: 12px; background: var(--green); color: #fff; border: none; padding: 10px; font-family: var(--sans); font-size: 0.72rem; letter-spacing: 1px; text-transform: uppercase; font-weight: 500; border-radius: 2px; cursor: pointer; transform: translateY(8px); opacity: 0; transition: all .3s; }
        .product-card:hover .product-quick-add { transform: translateY(0); opacity: 1; }
        .product-name { font-family: var(--serif); font-size: 1.05rem; color: var(--text); font-weight: 400; margin-bottom: 4px; }
        .product-fabric { font-size: 0.75rem; color: var(--text-light); letter-spacing: 0.5px; margin-bottom: 8px; }
        .product-price-row { display: flex; align-items: center; gap: 10px; }
        .product-price { font-size: 0.95rem; color: var(--text); font-weight: 500; }
        .product-price-old { font-size: 0.82rem; color: var(--text-light); text-decoration: line-through; }
        .product-colors { display: flex; gap: 5px; margin-top: 8px; }
        .color-dot { width: 12px; height: 12px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.1); }

        /* Tailoring CTA */
        .tailoring-section { background: var(--green); color: #fff; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .tailor-left .section-tag { color: var(--gold-light); }
        .tailor-left .section-tag::before { background: var(--gold-light); }
        .tailor-title { font-family: var(--serif); font-size: clamp(2rem, 3.5vw, 3rem); line-height: 1.2; color: #fff; font-weight: 300; margin-bottom: 20px; }
        .tailor-title em { color: var(--gold-light); font-style: italic; }
        .tailor-desc { font-size: 0.9rem; line-height: 1.9; color: rgba(255,255,255,0.7); font-weight: 300; margin-bottom: 32px; }
        .tailor-steps { display: flex; flex-direction: column; gap: 16px; margin-bottom: 36px; }
        .tailor-step { display: flex; gap: 16px; align-items: flex-start; }
        .step-num { width: 32px; height: 32px; border-radius: 50%; background: rgba(197,147,58,0.2); border: 1px solid rgba(197,147,58,0.4); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-family: var(--serif); font-size: 0.9rem; color: var(--gold-light); font-weight: 500; }
        .step-text { font-size: 0.85rem; color: rgba(255,255,255,0.75); line-height: 1.6; padding-top: 6px; }
        .step-text strong { color: #fff; font-weight: 500; display: block; margin-bottom: 2px; }
        .btn-tailor { padding: 14px 36px; background: var(--gold); color: #fff; border: none; font-family: var(--sans); font-size: 0.8rem; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 500; cursor: pointer; border-radius: 2px; transition: all .3s; display: inline-flex; align-items: center; gap: 8px; }
        .btn-tailor:hover { background: #fff; color: var(--green); }
        .tailor-right { position: relative; }
        .tailor-visual { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 32px; position: relative; overflow: hidden; }
        .tailor-visual::before { content: ''; position: absolute; top: -40px; right: -40px; width: 200px; height: 200px; border-radius: 50%; background: rgba(197,147,58,0.08); }
        .measure-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .measure-item { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 16px; }
        .measure-icon { font-size: 22px; margin-bottom: 8px; }
        .measure-label { font-size: 0.68rem; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.5); margin-bottom: 4px; }
        .measure-val { font-family: var(--serif); font-size: 1.1rem; color: #fff; font-weight: 400; }
        .fabric-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .fab-chip { padding: 6px 14px; border-radius: 20px; font-size: 0.72rem; letter-spacing: 0.5px; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.7); cursor: pointer; transition: all .2s; }
        .fab-chip.active { background: var(--gold); border-color: var(--gold); color: #fff; }
        .fab-chip:hover { border-color: var(--gold); color: var(--gold-light); }

        /* Why Us */
        .why-section { background: var(--cream); }
        .why-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; margin-top: 56px; }
        .why-card { background: var(--off-white); border: 1px solid var(--border-light); border-radius: 8px; padding: 32px 28px; transition: all .3s; position: relative; overflow: hidden; }
        .why-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--gold); transform: scaleX(0); transform-origin: left; transition: transform .3s; }
        .why-card:hover { transform: translateY(-4px); border-color: var(--border); }
        .why-card:hover::before { transform: scaleX(1); }
        .why-icon { width: 52px; height: 52px; border-radius: 8px; background: var(--cream); display: flex; align-items: center; justify-content: center; font-size: 26px; margin-bottom: 20px; }
        .why-title { font-family: var(--serif); font-size: 1.2rem; color: var(--text); margin-bottom: 10px; font-weight: 500; }
        .why-desc { font-size: 0.85rem; color: var(--text-muted); line-height: 1.75; font-weight: 300; }

        /* Wholesale Banner */
        .wholesale-section { background: var(--text); color: #fff; display: flex; align-items: center; justify-content: space-between; padding: 60px 8%; gap: 40px; }
        .ws-left { flex: 1; }
        .ws-tag { font-size: 0.7rem; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); font-weight: 500; margin-bottom: 12px; }
        .ws-title { font-family: var(--serif); font-size: clamp(1.6rem, 3vw, 2.4rem); color: #fff; font-weight: 300; line-height: 1.2; margin-bottom: 12px; }
        .ws-desc { font-size: 0.88rem; color: rgba(255,255,255,0.6); line-height: 1.8; font-weight: 300; }
        .ws-features { display: flex; gap: 32px; margin-top: 24px; flex-wrap: wrap; }
        .ws-feat { display: flex; align-items: center; gap: 10px; font-size: 0.8rem; color: rgba(255,255,255,0.7); }
        .ws-feat::before { content: '✓'; color: var(--gold); font-weight: 600; }
        .btn-ws { padding: 14px 36px; background: var(--gold); color: #fff; border: none; font-family: var(--sans); font-size: 0.8rem; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 500; cursor: pointer; border-radius: 2px; transition: all .3s; white-space: nowrap; }
        .btn-ws:hover { background: #fff; color: var(--text); }

        /* Testimonials */
        .testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 48px; }
        .testi-card { background: var(--cream); border: 1px solid var(--border-light); border-radius: 8px; padding: 28px; position: relative; }
        .testi-card::before { content: '"'; font-family: var(--serif); font-size: 5rem; color: var(--gold); opacity: 0.3; position: absolute; top: -10px; left: 20px; line-height: 1; }
        .testi-text { font-family: var(--serif); font-style: italic; font-size: 1rem; color: var(--text); line-height: 1.7; margin-bottom: 20px; position: relative; z-index: 1; }
        .testi-author { display: flex; align-items: center; gap: 12px; }
        .author-avatar { width: 38px; height: 38px; border-radius: 50%; background: var(--green); display: flex; align-items: center; justify-content: center; font-size: 0.85rem; color: #fff; font-weight: 500; font-family: var(--sans); }
        .author-name { font-size: 0.85rem; color: var(--text); font-weight: 500; }
        .author-loc { font-size: 0.72rem; color: var(--text-light); margin-top: 2px; }
        .star-row { display: flex; gap: 3px; margin-bottom: 14px; color: var(--gold); font-size: 13px; }

        /* Appointment Strip */
        .appt-strip { background: var(--gold-pale); border-top: 1px solid var(--border-light); border-bottom: 1px solid var(--border-light); padding: 48px 8%; display: flex; align-items: center; justify-content: space-between; gap: 32px; }
        .appt-icon { font-size: 3rem; margin-right: 4px; }
        .appt-text { flex: 1; }
        .appt-title { font-family: var(--serif); font-size: 1.5rem; color: var(--green); font-weight: 500; margin-bottom: 6px; }
        .appt-desc { font-size: 0.85rem; color: var(--text-muted); line-height: 1.7; font-weight: 300; }
        .btn-appt { padding: 12px 28px; background: var(--green); color: #fff; border: none; font-family: var(--sans); font-size: 0.78rem; letter-spacing: 1px; text-transform: uppercase; font-weight: 500; cursor: pointer; border-radius: 2px; transition: all .3s; white-space: nowrap; }
        .btn-appt:hover { background: var(--green-dark); }

        /* Footer */
        footer { background: var(--green-dark); color: rgba(255,255,255,0.7); padding: 64px 8% 32px; }
        .footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
        .footer-brand .logo-text { color: #fff; font-size: 1.4rem; }
        .footer-brand .logo-sub { color: var(--gold-light); }
        .footer-desc { font-size: 0.82rem; line-height: 1.8; margin-top: 14px; color: rgba(255,255,255,0.5); font-weight: 300; max-width: 260px; }
        .footer-socials { display: flex; gap: 12px; margin-top: 20px; }
        .social-btn { width: 34px; height: 34px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 13px; cursor: pointer; transition: all .2s; color: rgba(255,255,255,0.6); }
        .social-btn:hover { background: var(--gold); border-color: var(--gold); color: #fff; }
        .footer-col-title { font-size: 0.72rem; letter-spacing: 2px; text-transform: uppercase; color: #fff; font-weight: 500; margin-bottom: 18px; }
        .footer-links { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .footer-links a { font-size: 0.82rem; color: rgba(255,255,255,0.5); text-decoration: none; transition: color .2s; font-weight: 300; }
        .footer-links a:hover { color: var(--gold); }
        .footer-bottom { padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; }
        .footer-copy { font-size: 0.75rem; color: rgba(255,255,255,0.35); }
        .footer-badges { display: flex; gap: 12px; }
        .pay-badge { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); padding: 4px 10px; border-radius: 3px; font-size: 0.65rem; letter-spacing: 0.5px; color: rgba(255,255,255,0.5); }

        /* Overlays & FAB */
        .chatbot-fab { position: fixed; bottom: 28px; right: 28px; z-index: 500; width: 56px; height: 56px; border-radius: 50%; background: var(--green); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(27,67,50,0.4); transition: all .3s; }
        .chatbot-fab:hover { transform: scale(1.1); background: var(--green-dark); }
        .chatbot-fab svg { width: 24px; height: 24px; fill: none; stroke: #fff; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
        .chatbot-bubble { position: fixed; bottom: 96px; right: 28px; z-index: 500; background: var(--green); color: #fff; padding: 8px 16px; border-radius: 8px 8px 2px 8px; font-size: 0.78rem; white-space: nowrap; opacity: 0; transform: translateY(8px); transition: all .3s; pointer-events: none; }
        .chatbot-fab:hover ~ .chatbot-bubble, .chatbot-bubble:hover { opacity: 1; transform: translateY(0); }
        .back-top { position: fixed; bottom: 96px; right: 28px; z-index: 499; width: 40px; height: 40px; border-radius: 50%; background: rgba(253,250,246,0.9); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0; transition: all .3s; font-size: 16px; pointer-events: none; }
        .back-top.visible { opacity: 1; pointer-events: all; }

        .search-overlay { position: fixed; inset: 0; z-index: 2000; background: rgba(253,250,246,0.97); backdrop-filter: blur(8px); display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 120px 8% 40px; opacity: 0; pointer-events: none; transition: opacity .3s; }
        .search-overlay.open { opacity: 1; pointer-events: all; }
        .search-bar { width: 100%; max-width: 640px; position: relative; margin-bottom: 32px; }
        .search-bar input { width: 100%; padding: 18px 24px 18px 56px; font-family: var(--serif); font-size: 1.3rem; font-weight: 300; border: none; border-bottom: 2px solid var(--text); background: none; outline: none; color: var(--text); }
        .search-bar input::placeholder { color: var(--text-light); }
        .search-icon-big { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-size: 22px; color: var(--text-muted); }
        .search-close { position: absolute; top: 20px; right: 0; background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-muted); }
        .search-suggestions h4 { font-size: 0.7rem; letter-spacing: 2px; text-transform: uppercase; color: var(--text-light); margin-bottom: 16px; text-align: left; }
        .suggestion-chips { display: flex; flex-wrap: wrap; gap: 10px; max-width: 640px; }
        .sugg-chip { padding: 8px 18px; border: 1px solid var(--border); border-radius: 20px; font-size: 0.82rem; color: var(--text-muted); cursor: pointer; transition: all .2s; }
        .sugg-chip:hover { border-color: var(--green); color: var(--green); background: rgba(27,67,50,0.04); }

        .mobile-menu { position: fixed; inset: 0; z-index: 1500; background: var(--off-white); padding: 80px 8% 40px; display: flex; flex-direction: column; gap: 8px; transform: translateX(100%); transition: transform .35s ease; overflow-y: auto; }
        .mobile-menu.open { transform: translateX(0); }
        .mobile-menu a { font-family: var(--serif); font-size: 1.8rem; font-weight: 400; color: var(--text); text-decoration: none; padding: 12px 0; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; transition: color .2s; }
        .mobile-menu a:hover { color: var(--green); }
        .mobile-menu-close { position: absolute; top: 20px; right: 24px; background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-muted); }
        .mobile-ctas { display: flex; flex-direction: column; gap: 12px; margin-top: 24px; }
        .mobile-ctas .btn-primary, .mobile-ctas .btn-outline { width: 100%; justify-content: center; text-decoration: none; }

        /* Responsive */
        @media(max-width:1024px) {
          .categories-grid { grid-template-columns: repeat(2, 1fr); }
          .products-grid { grid-template-columns: repeat(2, 1fr); }
          .why-grid { grid-template-columns: 1fr 1fr; }
          .footer-top { grid-template-columns: 1fr 1fr; }
          .hero { grid-template-columns: 1fr; }
          .hero-right { display: none; }
          .tailoring-section { grid-template-columns: 1fr; gap: 40px; }
          .testi-grid { grid-template-columns: 1fr 1fr; }
        }
        @media(max-width:768px) {
          section { padding: 60px 6%; }
          nav { padding: 0 6%; }
          .nav-links, .btn-login, .btn-nav-primary, .nav-icon-btn:not(.cart-icon) { display: none; }
          .hamburger { display: flex; }
          .categories-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
          .products-grid { grid-template-columns: 1fr 1fr; gap: 16px; }
          .why-grid { grid-template-columns: 1fr; }
          .wholesale-section { flex-direction: column; }
          .appt-strip { flex-direction: column; text-align: center; }
          .footer-top { grid-template-columns: 1fr; }
          .testi-grid { grid-template-columns: 1fr; }
          .hero-stats { gap: 24px; }
          .ws-features { flex-direction: column; gap: 12px; }
        }

        /* Animations */
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        .fade-in { opacity: 0; animation: fadeUp .7s ease forwards; }
        .fade-in-1 { animation-delay: .1s; }
        .fade-in-2 { animation-delay: .25s; }
        .fade-in-3 { animation-delay: .4s; }
        .fade-in-4 { animation-delay: .55s; }
      `}</style>

      {/* SEARCH OVERLAY */}
      <div className={`search-overlay ${isSearchOpen ? 'open' : ''}`} id="searchOverlay">
        <div className="search-bar">
          <span className="search-icon-big">🔍</span>
          <input type="text" placeholder="Search fabrics, kurtas, custom wear…" id="searchInput" autoFocus={isSearchOpen} />
          <button className="search-close" onClick={toggleSearch}>✕</button>
        </div>
        <div className="search-suggestions">
          <h4>Popular Searches</h4>
          <div className="suggestion-chips">
            {['Khadi Kurta', 'Cotton Fabric', 'Silk Saree', 'Linen Blazer', 'Custom Tailoring', 'Wholesale Fabric', 'Khadi Jacket', 'Handloom Cloth'].map(term => (
              <span key={term} className="sugg-chip">{term}</span>
            ))}
          </div>
        </div>
      </div>


      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <div className="hero-eyebrow fade-in fade-in-1">Rampur Maniharan · Saharanpur, India</div>
          <h1 className="hero-title fade-in fade-in-2">
            Where <em>Tradition</em><br/>
            Meets Timeless<br/>
            Craftsmanship
          </h1>
          <p className="hero-desc fade-in fade-in-3">
            Hand-woven khadi fabrics, bespoke tailoring & artisan clothing. 
            From raw fabric to your custom fit — we weave stories into every thread.
          </p>
          <div className="hero-ctas fade-in fade-in-4">
            <Link to="/shop" className="btn-primary">Explore Collection →</Link>
            <Link to="/custom-tailoring" className="btn-outline">Custom Tailoring</Link>
          </div>
          <div className="hero-stats fade-in fade-in-4">
            <div className="stat-item">
              <div className="stat-num">2400+</div>
              <div className="stat-label">Products</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">15K+</div>
              <div className="stat-label">Happy Customers</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">38yr</div>
              <div className="stat-label">Heritage</div>
            </div>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-fabric-bg"></div>
          <div style={{ position: 'relative', zIndex: 2, padding: '48px 40px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '3.5rem', color: 'rgba(255,255,255,0.08)', fontWeight: 600, letterSpacing: '4px', position: 'absolute', top: '60px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>KHADI</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '0.8rem', letterSpacing: '3px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>New Collection 2025</div>
            </div>
            <div className="hero-product-card">
              <div className="hero-card-label">Featured Pick</div>
              <div className="hero-card-title">Handloom Kurta Set</div>
              <div className="hero-card-price">From ₹ 1,299 · Cotton Khadi</div>
              <span className="hero-card-tag">Custom Available</span>
            </div>
            <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🧵</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '1rem', color: '#fff', fontWeight: 400 }}>Custom Stitch</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>7-10 days</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(197,147,58,0.12)', border: '1px solid rgba(197,147,58,0.25)', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📏</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '1rem', color: '#fff', fontWeight: 400 }}>Free Measure</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Book Appointment</div>
              </div>
            </div>
            <div style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>🚚 Free shipping above ₹1,000</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--gold-light)' }}>COD Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-strip">
        <div className="marquee-inner">
          <span className="marquee-item"><span className="marquee-dot"></span>Pure Handwoven Khadi</span>
          <span className="marquee-item"><span className="marquee-dot"></span>Custom Tailoring in 7 Days</span>
          <span className="marquee-item"><span className="marquee-dot"></span>Wholesale Orders Welcome</span>
          <span className="marquee-item"><span className="marquee-dot"></span>Free Home Measurement Visit</span>
          <span className="marquee-item"><span className="marquee-dot"></span>GST Invoice Available</span>
          <span className="marquee-item"><span className="marquee-dot"></span>COD & Online Payment</span>
          <span className="marquee-item"><span className="marquee-dot"></span>15,000+ Happy Customers</span>
          <span className="marquee-item"><span className="marquee-dot"></span>38 Years of Heritage</span>
          
          <span className="marquee-item"><span className="marquee-dot"></span>Pure Handwoven Khadi</span>
          <span className="marquee-item"><span className="marquee-dot"></span>Custom Tailoring in 7 Days</span>
          <span className="marquee-item"><span className="marquee-dot"></span>Wholesale Orders Welcome</span>
          <span className="marquee-item"><span className="marquee-dot"></span>Free Home Measurement Visit</span>
          <span className="marquee-item"><span className="marquee-dot"></span>GST Invoice Available</span>
          <span className="marquee-item"><span className="marquee-dot"></span>COD & Online Payment</span>
          <span className="marquee-item"><span className="marquee-dot"></span>15,000+ Happy Customers</span>
          <span className="marquee-item"><span className="marquee-dot"></span>38 Years of Heritage</span>
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="categories-section">
        <div className="section-tag">Browse by Category</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <h2 className="section-title">Shop Our <em>Curated</em><br/>Collections</h2>
          <Link to="/shop" className="view-all">View All Categories →</Link>
        </div>
        <div className="categories-grid">
          <Link to="/shop/fabric-thaan" className="cat-card cat-1">
            <div className="cat-bg">
              <div className="cat-pattern"></div>
              <div className="cat-icon">🧶</div>
              <div className="cat-info">
                <div className="cat-label">Category 01</div>
                <div className="cat-name">Fabric &<br/>Raw Cloth</div>
                <div className="cat-count">240+ products</div>
                <div className="cat-arrow">→</div>
              </div>
            </div>
          </Link>
          <Link to="/shop/ready-made" className="cat-card cat-2">
            <div className="cat-bg">
              <div className="cat-pattern"></div>
              <div className="cat-icon">👔</div>
              <div className="cat-info">
                <div className="cat-label">Category 02</div>
                <div className="cat-name">Ready-Made<br/>Clothing</div>
                <div className="cat-count">580+ products</div>
                <div className="cat-arrow">→</div>
              </div>
            </div>
          </Link>
          <Link to="/custom-tailoring" className="cat-card cat-3">
            <div className="cat-bg">
              <div className="cat-pattern"></div>
              <div className="cat-icon">✂️</div>
              <div className="cat-info">
                <div className="cat-label">Category 03</div>
                <div className="cat-name">Custom<br/>Tailoring</div>
                <div className="cat-count">All styles available</div>
                <div className="cat-arrow">→</div>
              </div>
            </div>
          </Link>
          <Link to="/wholesale" className="cat-card cat-4">
            <div className="cat-bg">
              <div className="cat-pattern"></div>
              <div className="cat-icon">📦</div>
              <div className="cat-info">
                <div className="cat-label">Category 04</div>
                <div className="cat-name">Wholesale<br/>& Bulk</div>
                <div className="cat-count">MOQ from 10 units</div>
                <div className="cat-arrow">→</div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section>
        <div className="products-header">
          <div>
            <div className="section-tag">Handpicked for You</div>
            <h2 className="section-title">Bestselling <em>Products</em></h2>
          </div>
          <Link to="/shop" className="view-all">View All Products →</Link>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--green)', fontFamily: 'var(--serif)', fontSize: '1.2rem' }}>
            Curating exquisite pieces...
          </div>
        ) : (
          <div className="products-grid">
            {featuredProducts.length > 0 
              ? featuredProducts.map((p, idx) => (
                  <Link to={`/product/${p.slug}`} key={p.id} className="product-card product-card-anim">
                    <div className="product-img-wrap">
                      {p.thumbnail ? (
                        <img src={`http://localhost:8000/storage/${p.thumbnail}`} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div className="product-img-placeholder">🥻</div>
                      )}
                      {idx === 0 && <span className="product-badge new">New</span>}
                      <button className="product-wishlist" onClick={(e) => e.preventDefault()}>♡</button>
                      <button className="product-quick-add" onClick={(e) => e.preventDefault()}>+ Add to Cart</button>
                    </div>
                    <div className="product-name">{p.name}</div>
                    <div className="product-fabric">Authentic Khadi</div>
                    <div className="product-price-row">
                      <span className="product-price">₹{p.price}</span>
                    </div>
                  </Link>
                ))
              : fallbackProducts.map((p) => (
                  <Link to={`/product/${p.id}`} key={p.id} className="product-card product-card-anim">
                    <div className="product-img-wrap">
                      <div className="product-img-placeholder" style={p.icon === '🌿' ? { background: 'linear-gradient(135deg,#EAF3DE,#C0DD97)' } : {}}>
                        {p.icon}
                      </div>
                      {p.badge && <span className={`product-badge ${p.badge.toLowerCase() === 'new' ? 'new' : ''}`}>{p.badge}</span>}
                      <button className="product-wishlist" onClick={(e) => e.preventDefault()}>♡</button>
                      <button className="product-quick-add" onClick={(e) => e.preventDefault()}>+ Add to Cart</button>
                    </div>
                    <div className="product-name">{p.name}</div>
                    <div className="product-fabric">{p.fabric}</div>
                    <div className="product-price-row">
                      <span className="product-price">₹{p.price}</span>
                      {p.oldPrice && <span className="product-price-old">₹{p.oldPrice}</span>}
                    </div>
                    <div className="product-colors">
                      {p.colors.map(color => (
                        <div key={color} className="color-dot" style={{ background: color }}></div>
                      ))}
                    </div>
                  </Link>
                ))
            }
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Link to="/shop" className="btn-outline">Load More Products</Link>
        </div>
      </section>

      {/* CUSTOM TAILORING SECTION */}
      <section className="tailoring-section">
        <div className="tailor-left">
          <div className="section-tag">Bespoke Craftsmanship</div>
          <h2 className="tailor-title">Your <em>Perfect Fit,</em><br/>Handcrafted<br/>Just For You</h2>
          <p className="tailor-desc">
            Choose your fabric, pick your design, share your measurements — our master 
            tailors craft your perfect garment in 7–10 working days. Every stitch, every 
            detail, exactly as you imagined.
          </p>
          <div className="tailor-steps">
            <div className="tailor-step">
              <div className="step-num">1</div>
              <div className="step-text"><strong>Select Fabric & Style</strong>Browse our khadi, cotton, silk, and linen collections. Pick your design — kurta, coat-pant, blazer, or anything custom.</div>
            </div>
            <div className="tailor-step">
              <div className="step-num">2</div>
              <div className="step-text"><strong>Enter Measurements or Book Visit</strong>Save your measurements online or book a free home/shop measurement appointment.</div>
            </div>
            <div className="tailor-step">
              <div className="step-num">3</div>
              <div className="step-text"><strong>Track & Receive</strong>Real-time order tracking from cutting to delivery. Pay 50% advance, rest on delivery.</div>
            </div>
          </div>
          <Link to="/custom-tailoring" className="btn-tailor">Start Custom Order →</Link>
        </div>
        <div className="tailor-right">
          <div className="tailor-visual">
            <div style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>Measurement Profile</div>
            <div className="measure-grid">
              <div className="measure-item">
                <div className="measure-icon">📏</div>
                <div className="measure-label">Chest</div>
                <div className="measure-val">40"</div>
              </div>
              <div className="measure-item">
                <div className="measure-icon">📐</div>
                <div className="measure-label">Waist</div>
                <div className="measure-val">34"</div>
              </div>
              <div className="measure-item">
                <div className="measure-icon">↕️</div>
                <div className="measure-label">Length</div>
                <div className="measure-val">42"</div>
              </div>
              <div className="measure-item">
                <div className="measure-icon">💪</div>
                <div className="measure-label">Sleeve</div>
                <div className="measure-val">24"</div>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>Select Fabric</div>
              <div className="fabric-chips">
                {['Khadi Cotton', 'Silk Blend', 'Pure Linen', 'Handspun'].map(chip => (
                  <span 
                    key={chip} 
                    className={`fab-chip ${activeFabChip === chip ? 'active' : ''}`}
                    onClick={() => setActiveFabChip(chip)}
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ background: 'rgba(197,147,58,0.12)', border: '1px solid rgba(197,147,58,0.2)', borderRadius: '8px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '3px' }}>Estimated Ready In</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', color: '#fff' }}>7-10 Working Days</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '3px' }}>Starting From</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '1.4rem', color: 'var(--gold-light)' }}>₹899</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="why-section">
        <div className="section-tag">Why KhadiCraft</div>
        <h2 className="section-title">Crafted With <em>Purpose,</em><br/>Delivered With Pride</h2>
        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon">🌿</div>
            <div className="why-title">100% Authentic Khadi</div>
            <div className="why-desc">Every fabric is sourced directly from certified khadi artisans. We ensure genuine handwoven quality, supporting India's cottage industry since 1985.</div>
          </div>
          <div className="why-card">
            <div className="why-icon">✂️</div>
            <div className="why-title">Master Tailors, Perfect Fit</div>
            <div className="why-desc">Our experienced tailors have crafted thousands of custom garments. From measurement to delivery — precision at every step, guaranteed satisfaction.</div>
          </div>
          <div className="why-card">
            <div className="why-icon">📦</div>
            <div className="why-title">Wholesale & Bulk Ready</div>
            <div className="why-desc">Exclusive pricing for bulk buyers with GST invoicing, flexible MOQ, and quotation-based ordering. A trusted partner for retailers and businesses.</div>
          </div>
          <div className="why-card">
            <div className="why-icon">📍</div>
            <div className="why-title">Home Measurement Visit</div>
            <div className="why-desc">Can't come to the shop? Book a free home measurement visit. Our team comes to you, measures precisely, and ensures the perfect custom fit.</div>
          </div>
          <div className="why-card">
            <div className="why-icon">🔄</div>
            <div className="why-title">Live Order Tracking</div>
            <div className="why-desc">Know exactly where your order is — from fabric selection to stitching to delivery. 10-stage tracking for custom orders, real-time updates throughout.</div>
          </div>
          <div className="why-card">
            <div className="why-icon">💬</div>
            <div className="why-title">AI-Powered Support</div>
            <div className="why-desc">Our intelligent chatbot helps you choose the right fabric, understand care instructions, guide measurements, and answer any questions — anytime.</div>
          </div>
        </div>
      </section>

      {/* WHOLESALE BANNER */}
      <div className="wholesale-section">
        <div className="ws-left">
          <div className="ws-tag">For Businesses & Retailers</div>
          <h2 className="ws-title">Wholesale Pricing<br/>for Bulk Buyers</h2>
          <p className="ws-desc">Register as a wholesale buyer and unlock exclusive bulk pricing, GST invoicing, and dedicated account management. Minimum order quantities from just 10 units.</p>
          <div className="ws-features">
            <span className="ws-feat">Competitive Bulk Pricing</span>
            <span className="ws-feat">GST Invoice Support</span>
            <span className="ws-feat">Request a Quote</span>
            <span className="ws-feat">Dedicated Account Manager</span>
          </div>
        </div>
        <Link to="/wholesale" className="btn-ws">Register as Wholesale Buyer →</Link>
      </div>

      {/* TESTIMONIALS */}
      <section>
        <div className="section-tag">Customer Stories</div>
        <h2 className="section-title">What Our <em>Customers</em> Say</h2>
        <div className="testi-grid">
          <div className="testi-card">
            <div className="star-row">★★★★★</div>
            <p className="testi-text">"The custom kurta I ordered was beyond my expectations. The fit was perfect and the khadi fabric quality is outstanding. Will definitely order again!"</p>
            <div className="testi-author">
              <div className="author-avatar">RK</div>
              <div>
                <div className="author-name">Rajesh Kumar</div>
                <div className="author-loc">Saharanpur</div>
              </div>
            </div>
          </div>
          <div className="testi-card">
            <div className="star-row">★★★★★</div>
            <p className="testi-text">"Ordered wholesale fabric for my boutique. The quality is consistent and the GST invoice system makes accounting so easy. Highly recommended!"</p>
            <div className="testi-author">
              <div className="author-avatar">PS</div>
              <div>
                <div className="author-name">Priya Sharma</div>
                <div className="author-loc">Ludhiana</div>
              </div>
            </div>
          </div>
          <div className="testi-card">
            <div className="star-row">★★★★★</div>
            <p className="testi-text">"The home measurement service is a game changer! They came on time, took proper measurements, and my coat-pant came out perfectly tailored."</p>
            <div className="testi-author">
              <div className="author-avatar">AM</div>
              <div>
                <div className="author-name">Amit Mehra</div>
                <div className="author-loc">Mohali</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* APPOINTMENT STRIP */}
      <div className="appt-strip">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className="appt-icon">📅</span>
          <div className="appt-text">
            <div className="appt-title">Book a Free Measurement Appointment</div>
            <div className="appt-desc">Visit our shop in Rampur Maniharan, Saharanpur or request a home visit. Our master tailors will take precise measurements for your custom order — completely free of charge.</div>
          </div>
        </div>
        <Link to="/appointments" className="btn-appt">Book Appointment →</Link>
      </div>

      {/* CHATBOT FAB & BACK TO TOP */}
      <button className="chatbot-fab" onClick={() => alert('AI Chatbot — coming in next step! 🤖')}>
        <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      </button>
      <div className="chatbot-bubble">Ask our AI Assistant 💬</div>
      
      <div className="back-top" onClick={() => window.scrollTo(0,0)}>↑</div>
    </div>
  );
}