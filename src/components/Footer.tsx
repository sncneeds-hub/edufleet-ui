import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-gradient-to-b from-background to-primary/5 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">
              <span className="text-gradient">EduFleet</span>
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The complete marketplace for educational institutions. Connect for vehicles, jobs, and supplies.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-primary smooth-transition font-medium">Home</Link></li>
              <li><Link to="/browse" className="text-muted-foreground hover:text-primary smooth-transition font-medium">Browse Vehicles</Link></li>
              <li><Link to="/login" className="text-muted-foreground hover:text-primary smooth-transition font-medium">Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="text-muted-foreground hover:text-primary smooth-transition font-medium">Help Center</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary smooth-transition font-medium">Contact Us</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary smooth-transition font-medium">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="text-muted-foreground hover:text-primary smooth-transition font-medium">Privacy Policy</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary smooth-transition font-medium">Terms of Service</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary smooth-transition font-medium">Cookies</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            &copy; {currentYear} EduFleet. All rights reserved. | Trusted Marketplace for Educational Institutions
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-muted-foreground hover:text-primary smooth-transition font-semibold text-sm">Twitter</Link>
            <Link to="#" className="text-muted-foreground hover:text-primary smooth-transition font-semibold text-sm">LinkedIn</Link>
            <Link to="#" className="text-muted-foreground hover:text-primary smooth-transition font-semibold text-sm">Facebook</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
