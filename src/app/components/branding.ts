export const brandingConfig = {
  // Event Information
  eventTitle: "fwdLive! GOING FOR GROWTH 2025",
  eventDate: "12 June 2025",
  eventLocation: "Crowne Plaza, Stratford upon Avon",
  
  // Branding Colors (Tailwind classes)
  primaryColor: "blue",
  secondaryColor: "gray",
  
  // Logo Configuration
  logo: {
    url: "/api/placeholder-logo", // Replace with your actual logo path
    fallbackText: "FWD\nLIVE",
    alt: "fwdLive! Event Logo"
  },
  
  // Navigation Tabs
  tabs: [
    { id: "overview", label: "Overview", icon: "🏠" },
    { id: "venue", label: "Venue", icon: "📍" },
    { id: "sponsors", label: "Sponsors", icon: "🤝" },
    { id: "agenda", label: "Agenda", icon: "📅" },
    { id: "messages", label: "Messages", icon: "💬" },
    { id: "voting", label: "Voting", icon: "🗳️" }
  ],
  
  // Action Buttons
  actions: [
    { label: "Book Tickets", href: "/register", style: "primary" },
    { label: "Login", href: "/login", style: "secondary" }
  ],
  
  // Sponsor Banner (optional)
  sponsorBanner: {
    enabled: true,
    title: "Presented by:",
    sponsors: [
      { name: "Sponsor 1", logo: "/api/sponsor1-logo" },
      { name: "Sponsor 2", logo: "/api/sponsor2-logo" }
    ]
  }
}

export type BrandingConfig = typeof brandingConfig
