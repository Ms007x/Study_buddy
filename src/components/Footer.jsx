import { GraduationCap, Github, Twitter, Linkedin, Instagram } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                <div className="footer-brand">
                    <div className="logo">
                        <div className="logo-icon"><GraduationCap size={24} /></div>
                        <span className="logo-text">STUDYBUDDY</span>
                    </div>
                    <p>Empowering students to organize, analyze, and supercharge their learning journey using modern AI tools.</p>

                    <div className="footer-socials">
                        <a href="#" className="social-link"><Twitter size={18} /></a>
                        <a href="#" className="social-link"><Github size={18} /></a>
                        <a href="#" className="social-link"><Linkedin size={18} /></a>
                        <a href="#" className="social-link"><Instagram size={18} /></a>
                    </div>
                </div>

                <div className="footer-links">
                    <h4>Product</h4>
                    <ul>
                        <li><a href="#features">Features</a></li>
                        <li><a href="#pricing">Pricing</a></li>
                        <li><a href="#courses">Courses Explorer</a></li>
                        <li><a href="#ai-tools">AI Tools</a></li>
                    </ul>
                </div>

                <div className="footer-links">
                    <h4>Resources</h4>
                    <ul>
                        <li><a href="#blog">Blog</a></li>
                        <li><a href="#docs">Documentation</a></li>
                        <li><a href="#guides">Study Guides</a></li>
                        <li><a href="#webinars">Webinars</a></li>
                    </ul>
                </div>

                <div className="footer-links">
                    <h4>Company</h4>
                    <ul>
                        <li><a href="#about">About Us</a></li>
                        <li><a href="#careers">Careers</a></li>
                        <li><a href="#contact">Contact</a></li>
                        <li><a href="#partners">Partnerships</a></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} StudyBuddy. All rights reserved.</p>
                <div className="footer-bottom-links">
                    <a href="#privacy">Privacy Policy</a>
                    <a href="#terms">Terms of Service</a>
                    <a href="#cookies">Cookie Policy</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
