export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  contentType: string;
  slides: number;
  style: string;
  audience: string;
  language: "id" | "en";
  output: "prompt" | "prompt+caption" | "prompt+json";
  tags: string[];
}

export const TEMPLATES: PromptTemplate[] = [
  { id: "http-vs-https", title: "HTTP vs HTTPS", description: "Bandingkan protokol HTTP dan HTTPS dengan visual yang jelas.", category: "Networking", contentType: "Carousel Edukasi", slides: 5, style: "Modern Technology", audience: "Developer", language: "id", output: "prompt+json", tags: ["web", "security"] },
  { id: "session-cookie-jwt", title: "Session vs Cookie vs JWT", description: "Perbandingan mekanisme autentikasi populer.", category: "Auth", contentType: "Carousel Edukasi", slides: 8, style: "Apple Style", audience: "Developer", language: "id", output: "prompt+json", tags: ["auth", "web"] },
  { id: "docker-vs-vm", title: "Docker vs Virtual Machine", description: "Visualisasi perbedaan container dan VM.", category: "DevOps", contentType: "Infografis", slides: 3, style: "Corporate", audience: "Professional", language: "id", output: "prompt", tags: ["devops", "container"] },
  { id: "rest-vs-graphql", title: "REST API vs GraphQL", description: "Perbandingan arsitektur API modern.", category: "API", contentType: "Carousel Edukasi", slides: 5, style: "Google Style", audience: "Developer", language: "id", output: "prompt+caption", tags: ["api", "backend"] },
  { id: "sql-vs-nosql", title: "SQL vs NoSQL", description: "Kapan menggunakan SQL vs NoSQL database.", category: "Database", contentType: "Carousel Edukasi", slides: 5, style: "Minimal", audience: "Mahasiswa", language: "id", output: "prompt+json", tags: ["database"] },
  { id: "redis-vs-database", title: "Redis vs Database", description: "Cache layer dengan Redis vs database tradisional.", category: "Database", contentType: "Infografis", slides: 3, style: "Modern Technology", audience: "Developer", language: "id", output: "prompt", tags: ["cache", "redis"] },
  { id: "rabbitmq", title: "Apa itu RabbitMQ?", description: "Message broker untuk arsitektur microservices.", category: "Architecture", contentType: "Carousel Edukasi", slides: 5, style: "Futuristic", audience: "Developer", language: "id", output: "prompt+json", tags: ["queue", "broker"] },
  { id: "mqtt", title: "MQTT untuk IoT", description: "Protokol ringan untuk komunikasi IoT.", category: "IoT", contentType: "Poster", slides: 1, style: "Glassmorphism", audience: "Pemula", language: "id", output: "prompt", tags: ["iot"] },
  { id: "ci-cd", title: "CI/CD Pipeline", description: "Continuous integration & deployment yang baik.", category: "DevOps", contentType: "Carousel Edukasi", slides: 8, style: "Magazine", audience: "Professional", language: "id", output: "prompt+caption", tags: ["devops"] },
  { id: "load-balancer", title: "Load Balancer 101", description: "Distribusi traffic untuk aplikasi skala besar.", category: "Architecture", contentType: "Infografis", slides: 3, style: "Corporate", audience: "Developer", language: "id", output: "prompt+json", tags: ["scaling"] },
  { id: "oauth-vs-jwt", title: "OAuth vs JWT", description: "Perbandingan standar autentikasi modern.", category: "Auth", contentType: "Carousel Edukasi", slides: 5, style: "Apple Style", audience: "Developer", language: "id", output: "prompt+json", tags: ["auth"] },
  { id: "kubernetes", title: "Kubernetes Fundamentals", description: "Orchestrator container untuk production.", category: "DevOps", contentType: "Carousel Edukasi", slides: 10, style: "Futuristic", audience: "Professional", language: "id", output: "prompt+json", tags: ["k8s"] },
];

export const CONTENT_TYPES = [
  "Carousel Edukasi", "Poster", "Banner", "Infografis", "Instagram Post",
  "Facebook Post", "LinkedIn Carousel", "Presentasi", "Thumbnail YouTube", "Story Sosial Media",
] as const;

export const STYLES = [
  "Modern Technology", "Corporate", "Apple Style", "Google Style",
  "Glassmorphism", "Minimal", "Futuristic", "Magazine",
] as const;

export const AUDIENCES = ["Pemula", "Mahasiswa", "Developer", "Professional"] as const;
export const LANGUAGES = [{ value: "id", label: "Bahasa Indonesia" }, { value: "en", label: "English" }] as const;
export const SLIDE_OPTIONS = [1, 3, 5, 8, 10] as const;
export const OUTPUT_OPTIONS = [
  { value: "prompt", label: "Prompt saja" },
  { value: "prompt+caption", label: "Prompt + Caption" },
  { value: "prompt+json", label: "Prompt + JSON" },
] as const;
