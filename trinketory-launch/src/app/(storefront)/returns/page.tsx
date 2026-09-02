import ProsePage, { Block, Points } from "@/components/prose-page";

export const metadata = {
  title: "Returns",
  description:
    "Thirty days to change your mind, and what to do if something arrives faulty.",
};

export default function ReturnsPage() {
  return (
    <ProsePage
      title="Returns"
      intro="Thirty days to change your mind. No form to fill in, no reason required."
      updated="2 September 2026"
    >
      <Block heading="The short version">
        <Points
          items={[
            "30 days from the day it arrives.",
            "Unworn, undamaged, with any packaging it came in.",
            "Email hello@trinketory.com with your order number to start.",
            "Refunded to the original payment method once it reaches us.",
          ]}
        />
      </Block>

      <Block heading="How to send something back">
        <p>
          Email{" "}
          <a
            href="mailto:hello@trinketory.com"
            className="border-b border-line text-ink hover:border-accent hover:text-accent"
          >
            hello@trinketory.com
          </a>{" "}
          with your order number and which pieces are coming back. We will reply
          with the return address within one business day.
        </p>
        <p>
          Please do not post anything back before you hear from us — parcels
          that turn up unannounced are much harder to match to an order.
        </p>
      </Block>

      <Block heading="Who pays the postage">
        <p>
          Return postage is yours to cover if you have simply changed your mind,
          and we recommend a tracked service — until it arrives here it is still
          your parcel.
        </p>
        <p>
          If the piece is faulty, damaged in transit, or is not what you
          ordered, we cover the postage both ways. Send a photo with your email
          and we will sort it out.
        </p>
      </Block>

      <Block heading="Refunds">
        <p>
          Once your return arrives and has been checked, we refund to the
          original payment method within five business days. How quickly it
          appears after that is up to your bank, which is usually another few
          days.
        </p>
        <p>
          Original shipping is refunded only where the piece was faulty or
          incorrect.
        </p>
      </Block>

      <Block heading="Exchanges">
        <p>
          We do not process direct swaps — small runs mean the colourway you
          want may not still be here by the time yours arrives back. Return the
          original for a refund and order the one you want whenever suits you.
        </p>
      </Block>

      <Block heading="Your rights under Australian Consumer Law">
        <p>
          Nothing on this page limits your rights under the Australian Consumer
          Law. Our goods come with guarantees that cannot be excluded: you are
          entitled to a replacement or refund for a major failure, and to have
          goods repaired or replaced if they are not of acceptable quality. The
          30-day window above is what we offer on top of that, for changes of
          mind.
        </p>
      </Block>
    </ProsePage>
  );
}
