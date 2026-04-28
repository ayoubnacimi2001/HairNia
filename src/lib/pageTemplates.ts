const genId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

export const getPageTemplates = () => ({
  blankTemplate: [],

  serviceTemplate: [
    {
      id: genId('hero'),
      type: 'hero',
      props: {
        title: 'Nos Services Professionnels',
        subtitle: 'Une expertise inégalée pour équiper et entretenir votre salon.',
      },
      styles: {
        padding: '6rem 1rem',
        backgroundColor: 'transparent',
      }
    },
    {
      id: genId('textSplit'),
      type: 'textSplit',
      props: {
        title: 'Maintenance & Équipement',
        content: 'Nous proposons une gamme complète de services allant de la maintenance de vos tondeuses à l\'aménagement complet de votre salon de coiffure. Nos experts sont formés pour garantir la longévité de votre matériel.',
        imageUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=1000'
      },
      styles: {
        padding: '4rem 1rem',
        backgroundColor: 'var(--card)',
      }
    },
    {
      id: genId('featureGrid'),
      type: 'featureGrid',
      props: {
        columns: 3,
        features: [
          { title: 'Fiabilité', description: 'Matériel testé et approuvé par des professionnels.' },
          { title: 'Rapidité', description: 'Intervention et livraison express en 48h.' },
          { title: 'Support', description: 'Une équipe dédiée à votre écoute 7j/7.' }
        ]
      },
      styles: {
        padding: '4rem 1rem',
        backgroundColor: 'transparent',
      }
    }
  ],

  highTicketSalesTemplate: [
    {
      id: genId('hero'),
      type: 'hero',
      props: {
        title: 'Équipement Premium pour votre Salon',
        subtitle: 'Investissez dans l\'excellence. Garanti 10 ans. ⭐️ TrustPilot: 4.9/5',
      },
      styles: {
        padding: '8rem 1rem',
        backgroundColor: '#0a0a0a',
        color: '#d4af37'
      }
    },
    {
      id: genId('textSplit'),
      type: 'textSplit',
      props: {
        title: 'Matériaux Haut de Gamme',
        content: 'Chaque pièce est forgée avec de l\'acier japonais de première qualité, assurant une durabilité et une précision de coupe qui transforment le travail quotidien en véritable art.',
      },
      styles: {
        padding: '4rem 1rem',
        backgroundColor: 'transparent',
      }
    },
    {
      id: genId('testimonials'),
      type: 'testimonials',
      props: {
        reviews: [
          { name: 'Jean D.', role: 'Maître Barbier', text: 'Un investissement qui a transformé mon salon.' },
          { name: 'Sarah L.', role: 'Styliste', text: 'La précision de ces outils est tout simplement bluffante.' },
          { name: 'Marc P.', role: 'Propriétaire', text: 'Le service client justifie à lui seul le prix premium.' }
        ]
      },
      styles: {
        padding: '4rem 1rem',
        backgroundColor: 'var(--card)',
      }
    },
    {
      id: genId('dynamicForm'),
      type: 'dynamicForm',
      props: {
        title: 'Demander un Devis Personnalisé',
        subtitle: 'Laissez-nous vos coordonnées pour une consultation gratuite.'
      },
      styles: {
        padding: '4rem 1rem',
        backgroundColor: 'transparent',
      }
    }
  ],

  customerServiceTemplate: [
    {
      id: genId('hero'),
      type: 'hero',
      props: {
        title: 'Comment pouvons-nous vous aider ?',
        subtitle: 'Notre centre de support est là pour répondre à toutes vos questions.',
      },
      styles: {
        padding: '6rem 1rem',
        backgroundColor: 'var(--card)',
      }
    },
    {
      id: genId('featureGrid'),
      type: 'featureGrid',
      props: {
        columns: 3,
        features: [
          { title: 'Livraisons', description: 'Suivi de commande et délais.' },
          { title: 'Retours', description: 'Politique de retour et remboursements.' },
          { title: 'Manuels', description: 'Guides d\'utilisation et entretien.' }
        ]
      },
      styles: {
        padding: '4rem 1rem',
        backgroundColor: 'transparent',
      }
    },
    {
      id: genId('dynamicForm'),
      type: 'dynamicForm',
      props: {
        title: 'Ouvrir un Ticket de Support',
        subtitle: 'Un agent vous répondra sous 24h ouvrées.'
      },
      styles: {
        padding: '4rem 1rem',
        backgroundColor: 'var(--card)',
      }
    }
  ],

  faqTemplate: [
    {
      id: genId('hero'),
      type: 'hero',
      props: {
        title: 'Foire Aux Questions',
        subtitle: 'Trouvez rapidement les réponses à vos questions les plus fréquentes.',
      },
      styles: {
        padding: '5rem 1rem',
        backgroundColor: 'transparent',
      }
    },
    {
      id: genId('accordion'),
      type: 'accordion',
      props: {
        items: [
          { question: 'Quels sont les délais de livraison ?', answer: 'Nous expédions généralement sous 48h via livraison express.' },
          { question: 'Vos tondeuses sont-elles garanties ?', answer: 'Oui, tout notre matériel professionnel est garanti 2 ans.' },
          { question: 'Gérez-vous le voltage international ?', answer: 'Nos appareils sont compatibles 110V-240V pour une utilisation mondiale.' },
          { question: 'Acceptez-vous les retours ?', answer: 'Les retours sont acceptés sous 14 jours si le matériel n\'a pas été utilisé.' },
          { question: 'Proposez-vous des tarifs de gros ?', answer: 'Oui, contactez-nous via le formulaire pour les commandes de salon complètes.' }
        ]
      },
      styles: {
        padding: '2rem 1rem 4rem 1rem',
        backgroundColor: 'transparent',
      }
    },
    {
      id: genId('textSplit'),
      type: 'textSplit',
      props: {
        title: 'Vous avez encore besoin d\'aide ?',
        content: 'Si vous n\'avez pas trouvé la réponse à votre question, n\'hésitez pas à contacter notre support technique direct.',
      },
      styles: {
        padding: '4rem 1rem',
        backgroundColor: 'var(--card)',
      }
    }
  ],

  fitnessProgramTemplate: [
    {
      id: genId('hero'),
      type: 'hero',
      props: {
        title: 'Programme de Transformation',
        subtitle: 'Atteignez vos objectifs physiques avec notre méthode prouvée en 4 semaines.',
      },
      styles: {
        padding: '6rem 1rem',
        backgroundColor: '#111',
      }
    },
    {
      id: genId('featureGrid'),
      type: 'featureGrid',
      props: {
        columns: 4,
        features: [
          { title: 'Semaine 1', description: 'Fondations et conditionnement métabolique.' },
          { title: 'Semaine 2', description: 'Hypertrophie et surcharge progressive.' },
          { title: 'Semaine 3', description: 'Force pure et endurance.' },
          { title: 'Semaine 4', description: 'Peak performance et récupération active.' }
        ]
      },
      styles: {
        padding: '4rem 1rem',
        backgroundColor: 'transparent',
      }
    },
    {
      id: genId('text'),
      type: 'text',
      props: {
        content: 'La nutrition compte pour 70% de vos résultats. Ce programme inclut un guide macronutritionnel détaillé adapté à votre morphotype.',
      },
      styles: {
        padding: '3rem 1rem',
        backgroundColor: 'var(--card)',
        textAlign: 'center'
      }
    },
    {
      id: genId('hero'),
      type: 'hero',
      props: {
        title: 'Rejoignez l\'Élite',
        subtitle: 'Seulement 49€ pour un accès à vie. Commencez aujourd\'hui.',
      },
      styles: {
        padding: '5rem 1rem',
        backgroundColor: 'transparent',
      }
    }
  ],

  paymentPlanTemplate: [
    {
      id: genId('hero'),
      type: 'hero',
      props: {
        title: 'Financez votre Équipement',
        subtitle: 'Payez en plusieurs fois sans frais pour développer votre salon en toute sérénité.',
      },
      styles: {
        padding: '6rem 1rem',
        backgroundColor: 'transparent',
      }
    },
    {
      id: genId('featureGrid'),
      type: 'featureGrid',
      props: {
        columns: 3,
        features: [
          { title: '1. Choisissez', description: 'Sélectionnez votre équipement professionnel.' },
          { title: '2. Postulez', description: 'Remplissez le dossier de financement en 5 minutes.' },
          { title: '3. Recevez', description: 'Votre commande est expédiée immédiatement après validation.' }
        ]
      },
      styles: {
        padding: '4rem 1rem',
        backgroundColor: 'var(--card)',
      }
    },
    {
      id: genId('text'),
      type: 'text',
      props: {
        content: 'Conditions Générales : Financement sous réserve d\'acceptation par notre partenaire financier. Réservé aux professionnels disposant d\'un numéro de SIRET valide. Un crédit vous engage et doit être remboursé.',
      },
      styles: {
        padding: '3rem 1rem',
        backgroundColor: 'transparent',
        textAlign: 'justify'
      }
    }
  ],

  reservationTemplate: [
    {
      id: genId('hero'),
      type: 'hero',
      props: {
        title: 'Réservez votre Consultation',
        subtitle: 'Discutez avec un de nos maîtres barbiers de l\'aménagement de votre futur salon.',
      },
      styles: {
        padding: '8rem 1rem',
        backgroundColor: '#1a1a1a',
        color: '#d4af37'
      }
    },
    {
      id: genId('dynamicForm'),
      type: 'dynamicForm',
      props: {
        title: 'Vos Coordonnées',
        subtitle: 'Sélectionnez une date et laissez-nous vos informations.'
      },
      styles: {
        padding: '4rem 1rem',
        backgroundColor: 'transparent',
      }
    }
  ]
});