import ProsePage, { Block, Points } from "@/components/prose-page";

export const metadata = {
  title: "Privacy",
  description:
    "What Trinketory collects, who processes it, and how to have it deleted.",
};

const link =
  "border-b border-line text-ink hover:border-accent hover:text-accent";

export default function PrivacyPage() {
  return (
    <ProsePage
      title="Privacy"
      intro="We collect what an order needs and nothing else. There is no advertising or analytics tracking on this site."
      updated="2 September 2026"
    >
      <Block heading="What we collect">
        <Points
          items={[
            "Your name, email address and shipping address, when you place an order.",
            "What you bought, what you paid, and the status of the order.",
            "Anything you choose to put in an email to us.",
          ]}
        />
        <p>
          We do not ask for a date of birth, a phone number or an account
          password. There is no customer login on this site.
        </p>
      </Block>

      <Block heading="Payment details">
        <p>
          Card details are entered on Stripe&rsquo;s own checkout page and are
          never sent to, stored by, or visible to us. We receive confirmation
          that a payment succeeded, the amount, and the last four digits Stripe
          chooses to show. Stripe&rsquo;s handling of your data is governed by{" "}
          <a
            href="https://stripe.com/privacy"
            className={link}
            rel="noreferrer"
            target="_blank"
          >
            their privacy policy
          </a>
          .
        </p>
      </Block>

      <Block heading="Cookies">
        <p>
          Only what the shop needs to work. Your bag is kept in your own
          browser&rsquo;s local storage so it survives a refresh, and it never
          leaves your device except as the list of items sent to create a
          checkout. Stripe sets its own cookies on its checkout page for fraud
          prevention.
        </p>
        <p>
          No advertising cookies, no analytics, no third-party trackers, no
          pixels. That is why there is no cookie banner.
        </p>
      </Block>

      <Block heading="Who else touches your data">
        <Points
          items={[
            "Stripe — payment processing.",
            "Supabase — the database holding orders and the catalogue, hosted in Sydney.",
            "Vercel — hosting for the website itself.",
            "The postal carrier — name and address only, so it can be delivered.",
          ]}
        />
        <p>
          We do not sell, rent or share your details with anyone else, and we do
          not send marketing email unless you have asked for it.
        </p>
      </Block>

      <Block heading="How long we keep it">
        <p>
          Order records are kept for seven years, because Australian tax law
          requires it. Emails are kept as long as they are useful and then
          deleted.
        </p>
      </Block>

      <Block heading="Seeing or deleting your data">
        <p>
          Email{" "}
          <a href="mailto:hello@trinketory.com" className={link}>
            hello@trinketory.com
          </a>{" "}
          and we will send you everything we hold about you, correct it, or
          delete it — other than order records we are legally required to keep.
          We will reply within 30 days.
        </p>
      </Block>

      <Block heading="Where this sits legally">
        <p>
          Trinketory is an Australian business and handles personal information
          in line with the Australian Privacy Principles under the Privacy Act
          1988. If you think we have got something wrong, tell us first — and if
          you are not satisfied with the response, you can complain to the
          Office of the Australian Information Commissioner.
        </p>
      </Block>
    </ProsePage>
  );
}
