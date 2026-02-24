import './Hero.css';

const Hero = () => {
    return (
        <section className="hero-section">
            <h1 className="hero-title">
                "EMPOWERING SMARTER STUDYING THROUGH<br />
                <span className="hero-title-highlight">CLARITY, NOTES, <span className="text-blue">AND AI INSIGHTS</span></span>"
            </h1>

            <p className="hero-subtitle">
                RECORD YOUR NOTES. LET AI GUIDE YOU WITH MEANINGFUL<br />
                SUMMARIES. REFLECT ON YOUR GROWTH
            </p>

            <div className="hero-cta-container">
                <button className="btn-get-started">GET STARTED</button>
                <span className="hero-trial-text">14-days free trial</span>
            </div>
        </section>
    );
};

export default Hero;
