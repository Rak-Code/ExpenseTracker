import React from "react";
import { Github, Linkedin } from "lucide-react"; // Make sure lucide-react is installed

export function AppFooter() {
  return (
    <footer className="w-full border-t bg-background py-4 mt-8">
      <div className="container mx-auto px-4 flex flex-col items-center text-center text-sm text-muted-foreground gap-2">
        <div>
          © {new Date().getFullYear()} Rakesh Gupta. All rights reserved.
        </div>
        <div>
          Built with{" "}
          <a
            href="https://nextjs.org/"
            className="hover:text-primary mx-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            Next.js
          </a>{" "}
          &{" "}
          <a
            href="https://firebase.google.com/"
            className="hover:text-primary mx-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            Firebase
          </a>.
        </div>
        <div className="flex gap-4 mt-2">
          <a
            href="https://www.linkedin.com/in/rakesh-gupta-developer"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary"
          >
            <Linkedin className="w-5 h-5" />
          </a>
          <a
            href="https://github.com/Rak-Code"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
