export default function LocalBusinessLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FitnessCenter",
    name: "PINAKA FITNESS",
    image: "https://pinakafitness.com/logo1.png",
    "@id": "https://pinakafitness.com",
    url: "https://pinakafitness.com",
    telephone: "+91-9999999999",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Noida",
      addressLocality: "Noida",
      addressRegion: "UP",
      postalCode: "201301",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 28.5355,
      longitude: 77.391,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "06:00",
      closes: "22:00",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
