import Link from "next/link";
import ProsePage, { Block, Points } from "@/components/prose-page";

export const metadata = {
  title: "Shipping",
  description:
    "Where Trinketory ships, what it costs, and how long it takes to arrive.",
};

export default function ShippingPage() {
  return (
    <ProsePage
      title="Shipping"
      intro="Everything is packed by hand in Sydney. Here is what that costs and how long it takes."
      updated="2 September 2026"
    >
      <Block heading="Rates">
        <Points
          items={[
            "Standard shipping — $9.50 AUD, anywhere we ship.",
            "Free on orders over $80 AUD, applied automatically at checkout.",
          ]}
        />
        <p>
          Rates are the same whether the order is going to Marrickville or
          Manchester. Prices throughout the site are in Australian dollars.
        </p>
      </Block>

      <Block heading="Where we ship">
        <p>
          Australia, New Zealand, the United Kingdom, the United States,
          Canada, Ireland and Singapore.
        </p>
        <p>
          If your country is not on that list and you would like it to be,
          email{" "}
          <a
            href="mailto:hello@trinketory.com"
            className="border-b border-line text-ink hover:border-accent hover:text-accent"
          >
            hello@trinketory.com
          </a>{" "}
          — it is a short list because it is a small operation, not because we
          are not interested.
        </p>
      </Block>

      <Block heading="How long it takes">
        <p>
          Orders are packed within two business days. Once it is on its way you
          will get an email with tracking.
        </p>
        <Points
          items={[
            "Australia — 2 to 7 business days after dispatch.",
            "New Zealand and Singapore — 6 to 12 business days.",
            "UK, Ireland, US and Canada — 7 to 21 business days.",
          ]}
        />
        <p>
          Those are the carrier&rsquo;s estimates, not a guarantee. Customs can
          add time to an international parcel and there is nothing either of us
          can do to hurry it along.
        </p>
      </Block>

      <Block heading="Duties and taxes">
        <p>
          Orders outside Australia may attract import duties or taxes on
          arrival. These are set by your country, are not collected by us, and
          are the recipient&rsquo;s responsibility.
        </p>
      </Block>

      <Block heading="Addresses">
        <p>
          We send parcels to the address entered at checkout exactly as it is
          written. If you spot a mistake, email us straight away and quote your
          order number — if it has not been packed yet we can fix it. Once it
          has shipped, we cannot.
        </p>
      </Block>

      <Block heading="If something goes missing">
        <p>
          If tracking has not moved for ten business days, get in touch and we
          will chase the carrier. If a parcel is confirmed lost we will replace
          or refund it. See{" "}
          <Link
            href="/returns"
            className="border-b border-line text-ink hover:border-accent hover:text-accent"
          >
            Returns
          </Link>{" "}
          for anything that arrives damaged.
        </p>
      </Block>
    </ProsePage>
  );
}
