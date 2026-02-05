-- US-NEPAL LEGAL SOLUTIONS Database Schema
-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS us_nepal_legal_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE us_nepal_legal_db;

-- Admin users table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin (password: admin123)
-- Password is hashed using password_hash() - this is a placeholder
-- You should change this password after first login
INSERT INTO admins (username, email, password, full_name) VALUES
('admin', 'admin@usnepallegal.com', '$2y$10$eqF05ovfu/oqXjr.Rqqi6.jHoVC90PibiLvUV/P1BKJWlL5AodB2K', 'Administrator');

-- Sessions table for tracking admin sessions
CREATE TABLE IF NOT EXISTS admin_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    -- Use DATETIME for broad MySQL/MariaDB compatibility
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
    INDEX idx_token (session_token),
    INDEX idx_admin (admin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lawyers table
CREATE TABLE IF NOT EXISTS lawyers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    focus TEXT,
    image_url VARCHAR(500),
    image_fit VARCHAR(20) DEFAULT 'cover',
    image_position VARCHAR(50) DEFAULT '50% 25%',
    bio TEXT,
    email VARCHAR(100),
    phone VARCHAR(20),
    education TEXT,
    experience TEXT,
    specializations TEXT,
    bar_associations TEXT,
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default lawyers (matching current data)
INSERT INTO lawyers (name, role, focus, image_url, display_order) VALUES
('Pradeep Thapa', 'Managing Partner', 'Energy, Hydropower, Aviation & FDI', 'https://images.unsplash.com/photo-1559548331-f9cb98001426?auto=format&fit=crop&w=800&q=80', 1),
('Kedar Pyakurel', 'Principal Associate', 'Civil, Corporate & Writ Litigation', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80', 2),
('Muktinath Acharya', 'Senior Associate', 'Property Law, Civil Law & Family Law', 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=800&q=80', 3);

-- Additional dummy lawyers (richer profiles)
INSERT INTO lawyers (
  name, role, focus, image_url, bio, email, phone,
  education, experience, specializations, bar_associations,
  display_order, is_active
) VALUES
(
  'Sudeep Pradhan',
  'Associate',
  'Banking & Finance, Corporate Advisory',
  'https://images.unsplash.com/photo-1520975958225-3427ee9f5d64?auto=format&fit=crop&w=800&q=80',
  'Sudeep supports lenders and borrowers across financing transactions, documentation, and regulatory compliance. He focuses on clear drafting, risk reduction, and practical execution.',
  'sudeep.pradhan@usnepallegalsolutions.com',
  '+977-9800000004',
  'LLM (Business Law), Kathmandu University',
  '6+ years advising on secured lending, refinancing, and corporate governance matters.',
  'Banking & Finance, Corporate Governance, Due Diligence, Regulatory Compliance',
  'Nepal Bar Association',
  4,
  1
),
(
  'Deepak Khanal',
  'Associate',
  'Tax, Compliance & Advisory',
  'https://images.unsplash.com/photo-1558222218-b7b54eede3f3?auto=format&fit=crop&w=800&q=80',
  'Deepak advises clients on tax strategy, compliance reviews, and dispute support. He prepares actionable recommendations for management teams and supports audit readiness.',
  'deepak.khanal@usnepallegalsolutions.com',
  '+977-9800000005',
  'LLB, Nepal Law Campus',
  '5+ years in tax advisory, audit support, and regulatory filings across multiple industries.',
  'Tax Advisory, VAT/Customs, Corporate Compliance, Risk Reviews',
  'Nepal Bar Association',
  5,
  1
),
(
  'Amit Kerna',
  'Associate',
  'Commercial Contracts & Dispute Resolution',
  'https://images.unsplash.com/photo-1520975686471-6c2d47f1a0c0?auto=format&fit=crop&w=800&q=80',
  'Amit drafts and negotiates commercial agreements and supports clients in negotiation-led dispute resolution. He focuses on reducing risk while keeping deals practical and enforceable.',
  'amit.kerna@usnepallegalsolutions.com',
  '+977-9800000006',
  'LLB, Kathmandu School of Law',
  '4+ years drafting commercial contracts, advising on claims, and supporting arbitration preparations.',
  'Commercial Contracts, Arbitration Support, Corporate Documentation, Claims Strategy',
  'Nepal Bar Association',
  6,
  1
);

-- Practice Areas table
CREATE TABLE IF NOT EXISTS practice_areas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    text TEXT NOT NULL,
    icon_url VARCHAR(500),
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Publications table
CREATE TABLE IF NOT EXISTS publications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    text TEXT NOT NULL,
    image_url VARCHAR(500),
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Client Logos table
CREATE TABLE IF NOT EXISTS client_logos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    website_url VARCHAR(500),
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Journals table
CREATE TABLE IF NOT EXISTS journals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    image_url VARCHAR(500),
    description TEXT,
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insights table
CREATE TABLE IF NOT EXISTS insights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    text TEXT NOT NULL,
    image_url VARCHAR(500),
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hero Section Content table
CREATE TABLE IF NOT EXISTS hero_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    eyebrow_text VARCHAR(200),
    main_title VARCHAR(500),
    description TEXT,
    button_text VARCHAR(200),
    button_link VARCHAR(500),
    slider_interval_seconds INT DEFAULT 6,
    background_image_url VARCHAR(500),
    background_fit VARCHAR(20) DEFAULT 'cover',
    background_position VARCHAR(50) DEFAULT 'center',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hero Banners (multiple slides for homepage hero)
CREATE TABLE IF NOT EXISTS hero_banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    eyebrow_text VARCHAR(200),
    main_title VARCHAR(500),
    description TEXT,
    button_text VARCHAR(200),
    button_link VARCHAR(500),
    background_image_url VARCHAR(500),
    background_fit VARCHAR(20) DEFAULT 'cover',
    background_position VARCHAR(50) DEFAULT 'center',
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default hero banners (demo)
INSERT INTO hero_banners (eyebrow_text, main_title, description, button_text, button_link, background_image_url, display_order, is_active) VALUES
(
  'Experience Matters',
  'Serving with 100 Years\nof Combined Expertise',
  'Our lawyers offer clients a range of integrated global capabilities across Corporate, Litigation, Banking & Finance, and Aviation.',
  'WHY CLIENTS CHOOSE US? →',
  '/#about',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1800&q=80',
  1,
  1
),
(
  'Trusted Advisors',
  'Full-Service Legal\nSolutions in Nepal',
  'We support businesses and individuals with clear, practical advice — from contracts to complex disputes.',
  'Explore Practice Areas →',
  '/#practice',
  'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1800&q=80',
  2,
  1
),
(
  'Client First',
  'Professional Legal\nRepresentation',
  'A team of recognized lawyers delivering effective, solution-oriented legal services across Nepal.',
  'Meet Our Lawyers →',
  '/lawyers',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1800&q=80',
  3,
  1
)
ON DUPLICATE KEY UPDATE id=id;

-- Feature Strip Content table
CREATE TABLE IF NOT EXISTS feature_strips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title TEXT NOT NULL,
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Site Settings table (for general content)
CREATE TABLE IF NOT EXISTS site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'text',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Consultation requests (from homepage form)
CREATE TABLE IF NOT EXISTS consultation_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    appointment_date DATE NULL,
    appointment_time TIME NULL,
    about VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- About Us content (editable from admin)
CREATE TABLE IF NOT EXISTS about_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    text TEXT NOT NULL,
    image_url VARCHAR(500),
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO about_content (title, text, image_url, display_order, is_active) VALUES
(
  'About US-NEPAL LEGAL SOLUTIONS',
  'US-NEPAL LEGAL SOLUTIONS is a full-service law firm in Nepal delivering trusted legal counsel across corporate advisory, litigation, banking & finance, aviation, and foreign investment. Our team combines decades of experience with practical, client-first strategies.\n\nWe focus on clear communication, strong documentation, and effective representation—helping individuals and businesses navigate complex legal challenges with confidence.',
  'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&w=1400&q=80',
  1,
  1
)
ON DUPLICATE KEY UPDATE id=id;

-- Default site settings (editable from admin panel)
INSERT INTO site_settings (setting_key, setting_value, setting_type) VALUES
('site_name', 'US-NEPAL LEGAL SOLUTIONS', 'text'),
('site_tagline', 'LEGAL SOLUTIONS', 'text'),
('favicon_url', '/favicon.svg', 'url'),
('contact_email', 'info@usnepallegalsolutions.com', 'text'),
('contact_phone', '+1 (785) 506-3402', 'text'),
('contact_address', 'Anamnagar, Kathmandu', 'text'),
('footer_background_image_url', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80', 'url')
ON DUPLICATE KEY UPDATE
  setting_value = VALUES(setting_value),
  setting_type = VALUES(setting_type);

-- Insert default practice areas
INSERT INTO practice_areas (title, text, display_order) VALUES
('Arbitration & Dispute Resolution', 'US-NEPAL LEGAL SOLUTIONS has highly trained lawyers in Arbitration and Alternative Dispute Resolution.', 1),
('Aviation Law', 'The Firm specializes in aircraft registration, airworthiness, flight operations, air traffic management, airport security, and environmental protection.', 2),
('Due Diligence', 'US-NEPAL LEGAL SOLUTIONS has a dedicated group of investigators that is actively involved in investigative work related to relevant matters of our clients.', 3),
('Employment & Labor Law', 'US-NEPAL LEGAL SOLUTIONS deals in matters involving labor and employment contracts, labor and employment insurance, along with employee protection and welfare.', 4),
('Foreign Direct Investment (FDI)', 'Our Corporate Firm in Nepal provides assistance to foreign companies for routing entry strategies for investment in Nepal & incorporating their business.', 5),
('Hydropower Law', 'The Firm has engaged in obtaining approvals for multiple hydropower projects while developing a comprehensive legal strategy for compliance.', 6),
('Civil & Corporate Litigation', 'We offer litigation services across civil, criminal, and corporate domains. We represent clients on all types of criminal cases across courts and tribunals.', 7),
('Tax Law', 'We offer broad service in all aspects of tax law to corporate and high net-worth clients. Our tax lawyers bring wide experience dealing with often changing government tax rules.', 8),
('Telecommunications Law', 'US-NEPAL LEGAL SOLUTIONS is a Top Law Firm in Nepal assisting in registration, licensing and operation of Telecommunication companies in Nepal.', 9);

-- Insert default publications
INSERT INTO publications (title, text, image_url, display_order) VALUES
('Foreign Direct Investment (FDI) in Telecommunication Sector in Nepal', 'Foreign Direct Investment has become a major driver of Nepal''s telecommunication growth. From mobile networks to fiber...', 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=80', 1),
('FDI in Vehicle Manufacturing and Automobile Assembly Plant in Nepal', 'FDI in Nepal''s vehicle manufacturing sector offers big opportunities to cut imports, create jobs, and boost industrial growth.', 'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=900&q=80', 2),
('FDI in Cargo and Logistics Sector in Nepal', 'Foreign Direct Investment (FDI) in Nepal''s cargo and logistics industry drives growth in trade, warehousing, and...', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80', 3);

-- Insert default client logos
INSERT INTO client_logos (name, image_url, display_order) VALUES
('Himalayan Capital', 'https://dummyimage.com/160x60/ffffff/1f5e2e&text=Himalayan+Capital', 1),
('Tibet Airlines', 'https://dummyimage.com/160x60/ffffff/1f5e2e&text=Tibet+Airlines', 2),
('Bishwa Airways', 'https://dummyimage.com/160x60/ffffff/1f5e2e&text=Bishwa+Airways', 3),
('Malaysia Airlines', 'https://dummyimage.com/160x60/ffffff/1f5e2e&text=Malaysia+Airlines', 4),
('Frojob', 'https://dummyimage.com/160x60/ffffff/1f5e2e&text=Frojob', 5);

-- Insert default journals
INSERT INTO journals (title, image_url, display_order) VALUES
('Nepalese Aviation Law & Regulation', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80', 1),
('Consumer Court & Its Jurisdiction', 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&q=80', 2),
('Prospects of FDI in Nepal', 'https://images.unsplash.com/photo-1500534314209-a26db0f5c4b8?auto=format&fit=crop&w=600&q=80', 3);

-- Insert default insights
INSERT INTO insights (title, text, display_order) VALUES
('Process of Company Registration in Nepal', 'The Firm has researched the latest processes for incorporating a business in Nepal in the Office of Company Registrar. Company Registration in Nepal US-NEPAL LEGAL SOLUTIONS is a Corporate Law Firm in Nepal providing complete legal solutions for incorporating businesses in Nepal.', 1),
('Court Marriage in Nepal: Requirements & Process', 'The requirements, procedures & the costs associated with Court Marriage in Nepal is covered in the article. The Firm has the leading Marriage & Divorce Lawyer in Nepal.', 2),
('Divorce Process in Nepal: New Divorce Law', 'This latest insights into the practical aspects of conducting Divorce in Nepal along with the process of filing for divorce. US-NEPAL LEGAL SOLUTIONS provides full Family Law Services as a Civil Law Firm in Nepal.', 3);

-- Insert default hero content
INSERT INTO hero_content (eyebrow_text, main_title, description, button_text, button_link, background_image_url, is_active) VALUES
('Experience Matters', 'Serving with 100 Years\nof Combined Expertise', 'Our lawyers offer clients a range of integrated global capabilities. It includes some of the world''s most active Commercial Law, Corporate Law, Aviation Law, Banking & Finance Law and Corporate Litigation.', 'WHY CLIENTS CHOOSE US? →', '#', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2000&q=80', 1);

-- Insert default feature strips
INSERT INTO feature_strips (title, display_order) VALUES
('Leading Law Firm in Nepal providing complete Legal Solutions', 1),
('US-NEPAL LEGAL SOLUTIONS | Law Firm in Nepal | Lawyers in Nepal', 2),
('Team of Recognized Lawyers with 100 Years of Experience', 3);
