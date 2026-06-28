import React from 'react'

export const metadata = {
  title: "Politique de Confidentialité | DoniTalan",
  description: "Comment nous protégeons vos données personnelles sur DoniTalan.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">Politique de Confidentialité</h1>
          
          <div className="prose prose-slate max-w-none space-y-6">
            <p className="text-slate-600">
              <strong>Dernière mise à jour : 28 Juin 2026</strong>
            </p>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">1. Collecte des Données</h2>
              <p className="text-slate-600 leading-relaxed">
                Chez DoniTalan, nous collectons les informations nécessaires pour vous fournir nos services de mise en relation. 
                Cela inclut : vos noms, prénoms, numéro de téléphone, adresse email, ainsi que les documents légaux 
                (pièce d'identité, documents du véhicule) pour les transporteurs. Nous enregistrons également les données 
                de géolocalisation nécessaires au suivi des courses.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">2. Utilisation des Informations</h2>
              <p className="text-slate-600 leading-relaxed">
                Vos données sont utilisées exclusivement pour :
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2 text-slate-600">
                <li>Créer et gérer votre compte utilisateur.</li>
                <li>Faciliter la mise en relation entre clients et transporteurs.</li>
                <li>Sécuriser les transactions financières et vérifier les identités.</li>
                <li>Résoudre les litiges éventuels via notre service client.</li>
                <li>Améliorer l'expérience utilisateur sur notre plateforme.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">3. Protection et Sécurité</h2>
              <p className="text-slate-600 leading-relaxed">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles (chiffrement, serveurs sécurisés) 
                pour protéger vos données personnelles contre tout accès non autorisé, altération, divulgation ou destruction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">4. Partage des Données</h2>
              <p className="text-slate-600 leading-relaxed">
                Nous ne vendons en aucun cas vos données personnelles. Les informations nécessaires à l'exécution d'une 
                course (nom, téléphone, adresse) sont partagées entre le client et le transporteur uniquement au moment 
                de la validation d'une réservation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">5. Vos Droits</h2>
              <p className="text-slate-600 leading-relaxed">
                Vous disposez d'un droit d'accès, de rectification, et de suppression de vos données personnelles. 
                Vous pouvez exercer ces droits directement depuis les paramètres de votre compte ou en contactant 
                notre support technique à l'adresse support@donitalan.com.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
