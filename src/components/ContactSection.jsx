import { Mail, Phone, MapPin, Send } from 'lucide-react';
import './ContactSection.css';

const ContactSection = () => {
    return (
        <section id="contact" className="contact-section">
            <div className="contact-header-top">
                <h2 className="section-title">Get in Touch</h2>
                <p className="section-subtitle">Have questions or need support? We're here to help you on your learning journey.</p>
            </div>

            <div className="contact-grid">
                <div className="contact-info">
                    <div className="contact-info-bg-glow"></div>
                    <div className="contact-info-content">
                        <div className="contact-header-left">
                            <h2>Contact Information</h2>
                            <p>Fill out the form and our team will get back to you within 24 hours.</p>
                        </div>

                        <div className="contact-details-list">
                            <div className="contact-info-card">
                                <div className="contact-icon-wrapper">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h3>Email Us</h3>
                                    <p>support@studybuddy.com</p>
                                </div>
                            </div>

                            <div className="contact-info-card">
                                <div className="contact-icon-wrapper">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <h3>Call Us</h3>
                                    <p>+1 (555) 123-4567</p>
                                </div>
                            </div>

                            <div className="contact-info-card">
                                <div className="contact-icon-wrapper">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h3>Visit Us</h3>
                                    <p>123 Learning Lane<br />San Francisco, CA 94105</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="contact-form-container">
                    <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" className="study-input" placeholder="e.g. Jane Doe" required />
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" className="study-input" placeholder="jane@example.com" required />
                        </div>

                        <div className="form-group">
                            <label>Message</label>
                            <textarea className="study-input" rows="5" placeholder="How can we help you?" required />
                        </div>

                        <button type="submit" className="contact-submit-btn">
                            <Send size={18} /> Send Message
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
