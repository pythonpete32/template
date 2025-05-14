import { ContentArea } from "@/components/ContentArea";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col space-y-2">
      <Header />
      <ContentArea>
        <h1>Hello World</h1>
      </ContentArea>
    </div>
  );
}
