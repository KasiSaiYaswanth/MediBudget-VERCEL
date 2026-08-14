import { Pill } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t bg-secondary/20 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <Pill className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">MediBudget</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Estimate Before You Visit. Healthcare financial intelligence for everyone.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><Link to="/scanner" className="hover:text-foreground transition-colors">Medicine Scanner</Link></li>
              <li><Link to="/estimate" className="hover:text-foreground transition-colors">Cost Estimator</Link></li>
              <li><Link to="/install" className="text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors font-medium">Download Android App</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/disclaimer" className="hover:text-foreground transition-colors">Medical Disclaimer</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
              <li>
                <a 
                  href="mailto:medibudget@gmail.com?subject=MediBudget%20Support" 
                  className="hover:text-foreground transition-colors"
                >
                  medibudget@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} MediBudget. All rights reserved.</p>
          <p className="mt-1">This platform provides cost estimates only and does not constitute medical advice.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
