
import { Link } from "react-router-dom";
import {
  Droplet,
  HeartPulse,
  ShieldCheck,
  Clock,
  ArrowRight,
  Menu,
} from "lucide-react";

function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <Link to="/" className="landing-brand">
          <Droplet size={30} fill="currentColor" />
          <span>BloodCare</span>
        </Link>

        <nav className="landing-nav">
          <a href="#home">Home</a>
          <a href="#services">Services</a>
          <a href="#about">About Us</a>
        </nav>

        <div className="landing-actions">
          <Link to="/login" className="landing-login">Login</Link>
          <Link to="/register" className="landing-register">
            Get Started <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <section className="landing-hero" id="home">
        <div className="hero-content">
          <span className="hero-label">BLOOD MANAGEMENT SYSTEM</span>

          <h1>
            Every Drop Counts.
            <span> Every Life Matters.</span>
          </h1>

          <p>
            A centralized platform connecting blood donors, hospitals
            and blood inventory to make blood management simpler,
            faster and more reliable.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="landing-register">
              Get Started <ArrowRight size={17} />
            </Link>
            <Link to="/login" className="hero-secondary">
              Login to Your Account
            </Link>
          </div>

          <div className="hero-trust">
            <ShieldCheck size={19} />
            <span>Reliable blood inventory and request management</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-card">
            <img
              src="/hero.png"
              alt="Blood donation"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="hero-image-overlay">
              <HeartPulse size={38} />
              <h3>Donate Blood.</h3>
              <p>Help save lives.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-services" id="services">
        <div className="section-heading">
          <span>WHAT WE PROVIDE</span>
          <h2>One Platform. Better Blood Management.</h2>
          <p>Simple tools for managing the complete blood donation process.</p>
        </div>

        <div className="service-grid">
          <article className="service-card">
            <div className="service-icon"><Droplet size={25} /></div>
            <h3>Blood Inventory</h3>
            <p>View and manage available blood stock and blood groups.</p>
          </article>

          <article className="service-card">
            <div className="service-icon"><HeartPulse size={25} /></div>
            <h3>Donor Management</h3>
            <p>Maintain donor information and donation records.</p>
          </article>

          <article className="service-card">
            <div className="service-icon"><Clock size={25} /></div>
            <h3>Blood Requests</h3>
            <p>Hospitals can submit and track their blood requests.</p>
          </article>
        </div>
      </section>

      <section className="landing-about" id="about">
        <div>
          <span>ABOUT BLOODCARE</span>
          <h2>Making blood management organized and accessible.</h2>
          <p>
            BloodCare is designed to bring donors, hospitals and
            administrators together through a centralized system.
            It helps maintain accurate records of donations, blood
            stock, requests and blood issues.
          </p>
        </div>

        <div className="about-highlight">
          <HeartPulse size={38} />
          <h3>Connecting people who can help with people who need help.</h3>
        </div>
      </section>

      <footer className="landing-footer">
        <Link to="/" className="landing-brand">
          <Droplet size={24} fill="currentColor" />
          <span>BloodCare</span>
        </Link>
        <p>Blood Management System</p>
        <p>© {new Date().getFullYear()} BloodCare. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
