import React from 'react'

export const metadata = {
  title: "Conditions Générales d'Utilisation | DoniTalan",
  description: "Conditions d'utilisation de la plateforme de transport DoniTalan.",
}

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">Conditions Générales d'Utilisation</h1>
          
          <div className="prose prose-slate max-w-none space-y-6">
            <p className="text-slate-600">
              <strong>Dernière mise à jour : 28 Juin 2026</strong>
            </p>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">1. Présentation de la Plateforme</h2>
              <p className="text-slate-600 leading-relaxed">
                DoniTalan est une plateforme numérique de mise en relation entre des clients (particuliers ou entreprises) 
                souhaitant faire transporter des marchandises, et des propriétaires de camions ou chauffeurs indépendants. 
                DoniTalan agit uniquement en tant qu'intermédiaire technologique et n'est pas une entreprise de transport.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">2. Inscription et Compte Utilisateur</h2>
              <p className="text-slate-600 leading-relaxed">
                Pour utiliser les services de DoniTalan, l'utilisateur doit créer un compte et fournir des informations 
                exactes, complètes et à jour. Les propriétaires de camions doivent obligatoirement fournir les documents 
                légaux de leurs véhicules (carte grise, assurance, visite technique) pour validation par notre équipe 
                avant de pouvoir accepter des courses.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">3. Paiements et Commissions</h2>
              <p className="text-slate-600 leading-relaxed">
                Les paiements des courses sont sécurisés via Mobile Money (Orange Money, Wave, etc.) ou carte bancaire. 
                Le montant est bloqué (sécurisé) jusqu'à la confirmation de livraison. 
                DoniTalan prélève une commission sur chaque course réussie. Le pourcentage exact est affiché lors de 
                l'acceptation de la course par le transporteur.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">4. Responsabilités et Litiges</h2>
              <p className="text-slate-600 leading-relaxed">
                En cas de perte, de vol ou de dommage sur les marchandises pendant le transport, la responsabilité incombe 
                au transporteur (propriétaire du camion ou chauffeur). DoniTalan offre un service de médiation pour aider 
                à résoudre les litiges, mais ne peut être tenue responsable des dommages causés.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">5. Suspension et Résiliation</h2>
              <p className="text-slate-600 leading-relaxed">
                DoniTalan se réserve le droit de suspendre ou de supprimer le compte de tout utilisateur ne respectant pas 
                les présentes CGU, ayant un comportement inapproprié, ou accumulant des plaintes justifiées de la part 
                d'autres utilisateurs.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">6. Modification des CGU</h2>
              <p className="text-slate-600 leading-relaxed">
                Nous pouvons modifier ces conditions à tout moment. Les utilisateurs seront informés des changements 
                importants par email ou via une notification sur l'application. En continuant d'utiliser nos services 
                après modification, l'utilisateur accepte les nouvelles CGU.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
