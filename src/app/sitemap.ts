import type { MetadataRoute } from "next";
import { programs } from "@/lib/programData";
import { trainers } from "@/lib/trainerData";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pinakafitness.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/careers`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const programRoutes: MetadataRoute.Sitemap = programs.map((program) => ({
    url: `${baseUrl}/program/${program.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const trainerRoutes: MetadataRoute.Sitemap = trainers.map((trainer) => ({
    url: `${baseUrl}/trainer/${trainer.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...programRoutes, ...trainerRoutes];
}
