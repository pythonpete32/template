import { cn } from "@/lib/utils";
import Image from "next/image";

type Props = {
  imageUrl: string;
  caption: string;
  className?: string;
};

export default function ImageCard({ imageUrl, caption, className }: Props) {
  return (
    <figure
      className={cn(
        "w-[250px] overflow-hidden rounded-base border-2 border-border bg-main font-base shadow-shadow",
        className
      )}
    >
      <div className="w-full aspect-[4/3] relative">
        <Image
          className="object-cover"
          src={imageUrl}
          alt="image"
          fill
          sizes="(max-width: 768px) 100vw, 250px"
        />
      </div>
      <figcaption className="border-t-2 text-main-foreground border-border p-4">
        {caption}
      </figcaption>
    </figure>
  );
}
