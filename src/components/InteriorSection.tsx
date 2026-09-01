import DivisionSection from "./DivisionSection";
import { useSiteContent } from "../context/SiteContentContext";

export default function InteriorSection() {
  const { content } = useSiteContent();
  const data = content.divisions.find((division) => division.id === "interior");
  if (!data) return null;

  return <DivisionSection {...data} reverse />;
}
