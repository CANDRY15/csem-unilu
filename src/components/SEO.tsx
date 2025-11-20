import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEO = ({
  title = "CSEM UNILU - Cellule Scientifique des Etudiants en Médecine",
  description = "La Cellule Scientifique des Etudiants en Médecine de l'Université de Lubumbashi. Club scientifique membre des CLEF (Clubs Leaders des Etudiants Francophones - AUF).",
  keywords = "CSEM, médecine, Lubumbashi, UNILU, recherche médicale, étudiants médecine, club scientifique, CLEF, AUF",
  image = "https://csem-unilu.org/og-image.png",
  url = "https://csem-unilu.org",
  type = "website"
}: SEOProps) => {
  const siteTitle = title.includes("CSEM") ? title : `${title} | CSEM UNILU`;

  return (
    <Helmet>
      {/* Balises Meta de base */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="CSEM UNILU" />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* WhatsApp */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
    </Helmet>
  );
};
