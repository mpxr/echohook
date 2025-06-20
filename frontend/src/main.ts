import "./style.css";
import { generateApiDocsHTML } from "./api-docs.ts";

declare const lucide: any;

const homePageHTML = document.body.innerHTML;

const routes: { [key: string]: () => void } = {
  "/": () => {
    document.body.innerHTML = homePageHTML;
    runHomePageScript();
  },
  "/docs/api": () => {
    document.body.innerHTML = generateApiDocsHTML();
  },
};

const handleRouting = () => {
  const path = window.location.pathname;
  const routeHandler = routes[path] || routes["/"];
  routeHandler();
  lucide.createIcons();
};

const runHomePageScript = () => {
  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (this: HTMLAnchorElement, e) {
      e.preventDefault();
      const href = this.getAttribute("href");
      if (!href) return;
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Add scroll effect to navigation
  window.addEventListener("scroll", function () {
    const nav = document.querySelector("nav");
    if (nav) {
      if (window.scrollY > 100) {
        nav.classList.add("backdrop-blur-md", "bg-white/80");
      } else {
        nav.classList.remove("backdrop-blur-md", "bg-white/80");
      }
    }
  });

  // Animate elements on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLElement;
        target.style.opacity = "1";
        target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Observe feature cards
  document.querySelectorAll(".feature-card").forEach((card) => {
    const c = card as HTMLElement;
    c.style.opacity = "0";
    c.style.transform = "translateY(20px)";
    c.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(card);
  });
};

// Handle routing on initial load
handleRouting();

// Handle routing on back/forward navigation
window.addEventListener("popstate", handleRouting);

// Intercept navigation for internal links
document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  const anchor = target.closest("a");
  if (anchor && anchor.pathname in routes) {
    e.preventDefault();
    history.pushState({}, "", anchor.href);
    handleRouting();
  }
});
