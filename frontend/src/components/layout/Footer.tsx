import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  ArrowUpRight,
} from "lucide-react";
import { cmsApi } from "../../api/cms";
import type { Page, SiteSetting } from "../../types";

export default function Footer() {
  const [settings, setSettings] = useState<SiteSetting | null>(null);
  const [footerPages, setFooterPages] = useState<Page[]>([]);

  useEffect(() => {
    Promise.all([
      cmsApi.getSiteSettings().catch(() => null),
      cmsApi.getFooterPages().catch(() => []),
    ]).then(([settingsRes, pages]) => {
      if (settingsRes) setSettings(settingsRes.data);
      setFooterPages(pages);
    });
  }, []);

  const socialLinks = [
    { url: settings?.facebook_url, icon: Facebook, label: "Facebook" },
    { url: settings?.twitter_url, icon: Twitter, label: "Twitter" },
    { url: settings?.linkedin_url, icon: Linkedin, label: "LinkedIn" },
    { url: settings?.youtube_url, icon: Youtube, label: "YouTube" },
    { url: settings?.instagram_url, icon: Instagram, label: "Instagram" },
  ].filter((s) => s.url);

  return (
    <footer className="border-t border-gray-200 bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                {settings?.site_name || "LMS"}
              </span>
            </Link>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              {settings?.site_tagline || "A modern learning management system for students, instructors, and administrators."}
            </p>
            <div className="mt-4 flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                  title={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Quick Links</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link to="/courses" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                  Browse Courses <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                  Blog <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Log In
                </Link>
              </li>
            </ul>
          </div>

          {/* Pages */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Resources</h3>
            <ul className="mt-4 space-y-2.5">
              {footerPages.length > 0 ? (
                footerPages.map((page) => (
                  <li key={page.id}>
                    <Link
                      to={`/page/${page.slug}`}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {page.title}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link to="/page/about" className="text-sm text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                  <li><Link to="/page/contact" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                  <li><Link to="/page/terms" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link to="/page/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Contact</h3>
            <ul className="mt-4 space-y-3">
              {settings?.email && (
                <li>
                  <a href={`mailto:${settings.email}`} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                    <Mail className="h-4 w-4 shrink-0" /> {settings.email}
                  </a>
                </li>
              )}
              {settings?.phone && (
                <li>
                  <a href={`tel:${settings.phone}`} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                    <Phone className="h-4 w-4 shrink-0" /> {settings.phone}
                  </a>
                </li>
              )}
              {settings?.address && (
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" /> {settings.address}
                </li>
              )}
              {!settings?.email && (
                <li className="text-sm text-gray-400">support@lmsplatform.com</li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} {settings?.site_name || "LMS"}. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <Link to="/page/privacy" className="hover:text-gray-300 transition-colors">Privacy</Link>
            <Link to="/page/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
            <Link to="/page/contact" className="hover:text-gray-300 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
