import Link from "next/link";
import ProsePage, { Block } from "@/components/prose-page";

export const metadata = {
  title: "Terms",
  description: "The terms you agree to when you buy something from Trinketory.",
};

const link =
  "border-b border-line text-ink hover:border-accent hover:text-accent";

export default function TermsPage() {
  return (
    <ProsePage
      title="Terms of sale"
      intro="Plain language, because nobody has ever been helped by six pages of capital letters."
      updated="2 September 2026"
    >
      <Block heading="Who you are buying from">
        <p>
          Trinketory, an Australian business trading at trinketory.com. Contact:{" "}
          <a href="mailto:hello@trinketory.com" className={link}>
            hello@trinketory.com
          </a>
          .
        </p>
      </Block>

      <Block heading="Prices">
        <p>
          All prices are in Australian dollars and include any Australian tax
          that applies. Shipping is added at checkout. Import duties and taxes
          on international orders are not included and are the
          recipient&rsquo;s responsibility.
        </p>
        <p>
          We can change prices at any time, but never after you have placed an
          order.
        </p>
      </Block>

      <Block heading="Orders">
        <p>
          Your order is an offer to buy. It is accepted when we dispatch it, not
          when the payment clears. If something turns out to be unavailable
          after you have paid — miscounted stock, a piece damaged in packing —
          we will tell you and refund that item in full.
        </p>
        <p>
          We may decline or cancel an order where we suspect fraud, where a
          price was listed in obvious error, or where we cannot ship to the
          address given.
        </p>
      </Block>

      <Block heading="Stock and descriptions">
        <p>
          Everything is made in short runs and stock counts can be briefly out
          of date. We describe each piece as accurately as we can, including its
          materials and measurements. Colours vary between screens, and
          handmade and hand-finished pieces vary slightly between one another —
          that is the nature of them, not a fault.
        </p>
      </Block>

      <Block heading="Delivery and returns">
        <p>
          Covered in full on the{" "}
          <Link href="/shipping" className={link}>
            shipping
          </Link>{" "}
          and{" "}
          <Link href="/returns" className={link}>
            returns
          </Link>{" "}
          pages, which form part of these terms. Risk in the goods passes to you
          on delivery.
        </p>
      </Block>

      <Block heading="Your consumer guarantees">
        <p>
          Our goods come with guarantees that cannot be excluded under the
          Australian Consumer Law. You are entitled to a replacement or refund
          for a major failure and to compensation for any other reasonably
          foreseeable loss or damage, and to have goods repaired or replaced if
          they fail to be of acceptable quality.
        </p>
        <p>
          Except for those guarantees, and to the extent the law allows, our
          liability for any claim is limited to the amount you paid for the
          item.
        </p>
      </Block>

      <Block heading="Using this site">
        <p>
          The photography, product names and written copy on this site belong to
          Trinketory. Please do not reuse them commercially without asking.
          Otherwise: browse, screenshot, share, enjoy.
        </p>
      </Block>

      <Block heading="Governing law">
        <p>
          These terms are governed by the laws of New South Wales, Australia.
        </p>
      </Block>
    </ProsePage>
  );
}
