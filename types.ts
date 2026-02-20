export interface NavItem {
  label: string;
  href: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface FeatureTab {
  id: string;
  number: string;
  title: string;
  description: string;
  detail: string;
}

export interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  company: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface DesignPrinciple {
  icon: string;
  category: string;
  title: string;
  description: string;
}