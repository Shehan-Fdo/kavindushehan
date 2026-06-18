import HomeSection from "@/components/Home";
import About from "@/components/About";
import WorkSection, { WorkItem } from "@/components/WorkSection";
import Footer from "@/components/Footer";

interface APIProject {
  id: string;
  title: string;
  description: string;
  category: string[];
  tools: string[];
  images: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface APIResponse {
  total: number;
  data: APIProject[];
}

export default async function Page() {
  let items: WorkItem[] = [];

  try {
    const res = await fetch("https://portfolio-api.shehan-dev.workers.dev/projects", { cache: "no-store" });
    if (res.ok) {
      const json: APIResponse = await res.json();
      items = json.data.map(project => ({
        name: project.title,
        type: project.images.length > 1 ? ("directory" as const) : ("file" as const),
        coverImage: project.images[0] || "",
        images: project.images,
        description: project.description,
        category: project.category,
        tools: project.tools,
      }));
    }
  } catch (err) {
    console.error("Failed to fetch work projects from API", err);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex flex-col min-h-screen">
        <HomeSection />
      </div>
      <About />
      {items.length > 0 && (
        <WorkSection items={items} />
      )}
      <Footer />
    </div>
  );
}

