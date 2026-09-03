import Link from "next/link";
import ProsePage, { Block } from "@/components/prose-page";

export const metadata = {
  title: "FAQ",
  description:
    "Sizing, shipping, restocks, payment and everything else people ask.",
};

const link =
  "border-b border-line text-ink hover:border-accent hover:text-accent";

export default function FaqPage() {
  return (
    <ProsePage
      title="Questions, answered"
      intro="If yours is not here, email hello@trinketory.com and it probably will be next time."
    >
      <Block heading="Which claw clip should I get?">
        <p>
          The Knot and Winter Coat are the full-size ones — they hold thick or
          long hair on their own. The Understudy and Long Story suit medium
          hair and everyday wear. The mini claws are for a fringe, a half-up, or
          pinning back the bits that will not behave; they are not meant to hold
          a whole head of hair.
        </p>
      </Block>

      <Block heading="Will it hold fine or slippery hair?">
        <p>
          Yes, in the sense that everything here has a proper steel spring and
          deep teeth rather than a decorative hinge. Fine hair generally does
          better with a smaller clip taking a smaller section than with a large
          clip taking everything.
        </p>
      </Block>

      <Block heading="How long until it arrives?">
        <p>
          Packed within two business days, then 2 to 7 business days within
          Australia and 6 to 21 internationally.{" "}
          <Link href="/shipping" className={link}>
            Full shipping detail here
          </Link>
          .
        </p>
      </Block>

      <Block heading="Can I return it?">
        <p>
          Thirty days, unworn, no reason needed.{" "}
          <Link href="/returns" className={link}>
            How returns work
          </Link>
          .
        </p>
      </Block>

      <Block heading="Do you restock?">
        <p>
          Sometimes. Everything is made in short runs, and a colourway that
          sells out may come back, may come back slightly different, or may not
          come back at all — usually because the material has moved on. New
          pieces go up most Fridays.
        </p>
      </Block>

      <Block heading="How do I pay?">
        <p>
          Checkout runs on Stripe. Visa, Mastercard and American Express, plus
          Apple Pay and Google Pay where your device supports them. Your card
          details go straight to Stripe — they never touch this site.
        </p>
      </Block>

      <Block heading="Are the colours accurate?">
        <p>
          Close, but every screen is a liar in its own particular way. Photos
          are shot in daylight with no colour grading, so what you see is close
          to what turns up. If a piece is not what you expected, send it back.
        </p>
      </Block>

      <Block heading="Do you do wholesale?">
        <p>
          Small quantities, occasionally, for shops we like. Email{" "}
          <a href="mailto:hello@trinketory.com" className={link}>
            hello@trinketory.com
          </a>{" "}
          with a link to yours.
        </p>
      </Block>

      <Block heading="How do I look after any of this?">
        <p>
          Material by material,{" "}
          <Link href="/care" className={link}>
            on the care page
          </Link>
          . The short version: keep acetate away from heat and gold plating away
          from water.
        </p>
      </Block>
    </ProsePage>
  );
}
