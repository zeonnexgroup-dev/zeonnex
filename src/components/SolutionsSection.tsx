import DivisionSection from "./DivisionSection";
import { useSiteContent } from "../context/SiteContentContext";

export default function SolutionsSection() {
  const { content } = useSiteContent();
  const data = content.divisions.find((division) => division.id === "solutions");
  if (!data) return null;

  return <DivisionSection {...data} />;
}
