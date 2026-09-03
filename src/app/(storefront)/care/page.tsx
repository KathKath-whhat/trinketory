import ProsePage, { Block, Points } from "@/components/prose-page";

export const metadata = {
  title: "Care",
  description:
    "How to keep acetate, silk, faux fur and gold plating looking new.",
};

export default function CarePage() {
  return (
    <ProsePage
      title="Care"
      intro="None of this is difficult. Most of it is just keeping things away from heat and water."
    >
      <Block heading="Acetate claws and pins">
        <Points
          items={[
            "Keep them away from straighteners, curling wands and hot car dashboards — acetate softens and warps well below the heat those put out.",
            "Wipe with a soft dry cloth. No alcohol, no solvents; both dull the finish.",
            "Clip them onto something rather than leaving them clenched shut, which tires the spring.",
          ]}
        />
      </Block>

      <Block heading="Silk scrunchies">
        <Points
          items={[
            "Hand wash in cool water with a little gentle detergent.",
            "Squeeze, never wring. Lay flat to dry, out of direct sun.",
            "Do not tumble dry, and keep them out of the machine even in a bag.",
          ]}
        />
      </Block>

      <Block heading="Cotton and crinkle scrunchies">
        <p>
          Machine washable, cool, inside a laundry bag so the elastic does not
          get caught. Line dry. A warm iron on the fabric side is fine if you
          are the sort of person who irons a scrunchie.
        </p>
      </Block>

      <Block heading="Faux fur">
        <Points
          items={[
            "Spot clean only, with a barely damp cloth.",
            "Let it dry fully, then brush the pile back up with a soft toothbrush.",
            "Never submerge one — the adhesive under the fur does not forgive it.",
          ]}
        />
      </Block>

      <Block heading="Gold-plated pins and forks">
        <Points
          items={[
            "Take them out before swimming, showering or sleeping.",
            "Perfume, hairspray and sunscreen all attack plating. Style your hair first, then put the pin in.",
            "Store dry and separately — loose in a bowl with other metal is how plating gets scratched.",
          ]}
        />
      </Block>

      <Block heading="Enamel and resin">
        <p>
          Wipe clean with a soft dry cloth. Avoid perfume and alcohol-based
          products, which can cloud the surface over time. Enamel chips if you
          drop it on tile, and that is not something we can polish out.
        </p>
      </Block>

      <Block heading="Pearls">
        <p>
          Freshwater pearls are the fussiest thing here. Last thing on, first
          thing off, and wipe with a soft cloth after wearing.
        </p>
      </Block>
    </ProsePage>
  );
}
