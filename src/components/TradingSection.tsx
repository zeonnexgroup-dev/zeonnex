import DivisionSection from "./DivisionSection";
import { useSiteContent } from "../context/SiteContentContext";

export default function TradingSection() {
  const { content } = useSiteContent();
  const data = content.divisions.find((division) => division.id === "trading");
  if (!data) return null;

  return <DivisionSection {...data} />;
}
