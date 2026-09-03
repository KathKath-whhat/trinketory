import Link from "next/link";
import ProsePage, { Block, Points } from "@/components/prose-page";

export const metadata = {
  title: "Contact",
  description: "How to reach Trinketory, and what to include so it is quick.",
};

const link =
  "border-b border-line text-ink hover:border-accent hover:text-accent";

export default function ContactPage() {
  return (
    <ProsePage
      title="Say hello"
      intro="One inbox, read by an actual person, usually within a business day."
    >
      <Block heading="Email">
        <p>
          <a href="mailto:hello@trinketory.com" className={link}>
            hello@trinketory.com
          </a>
        </p>
        <p>
          We are in Sydney, so replies land on Australian Eastern time. Anything
          sent over a weekend gets picked up Monday.
        </p>
      </Block>

      <Block heading="If it is about an order">
        <p>Include these and it will be sorted in one reply rather than four:</p>
        <Points
          items={[
            "Your order number — it is in your confirmation email.",
            "The email address you ordered with.",
            "A photo, if something arrived damaged or wrong.",
          ]}
        />
      </Block>

      <Block heading="Before you write">
        <p>
          Most questions are already answered on the{" "}
          <Link href="/faq" className={link}>
            FAQ
          </Link>
          ,{" "}
          <Link href="/shipping" className={link}>
            shipping
          </Link>{" "}
          and{" "}
          <Link href="/returns" className={link}>
            returns
          </Link>{" "}
          pages. If yours is not, that is our fault and we would like to hear it.
        </p>
      </Block>

      <Block heading="Stockists and collaborations">
        <p>
          Small wholesale runs go to shops we would buy from ourselves. Send a
          link and roughly what you have in mind. We are slow to say yes and
          quick to reply either way.
        </p>
      </Block>
    </ProsePage>
  );
}
