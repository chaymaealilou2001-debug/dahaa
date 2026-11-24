'use strict';
// Banque de mots pour « Le Mot Secret ».
// Pas d'IA : chaque mot secret a une liste de mots proches avec un taux de proximité (0–100).
// Pour un mot absent de la liste, on estime la proximité en passant par un mot commun
// (ex. « surf » est proche de « plage », et « plage » est proche de « mer »).

const WORDS = (() => {
  const RAW = {
    'mer': 'océan 94|flots 85|vague 80|plage 78|sel 55|bateau 70|poisson 65|marin 74|port 66|île 68|sable 60|côte 75|eau 72|plongée 62|requin 58|baleine 60|coquillage 57|marée 79|rivage 82|lac 64|rivière 58|natation 52|bleu 50|horizon 54|voile 58|pêcheur 60|phare 63|tempête 52|algue 59|dauphin 61|croisière 63|mouette 60|golfe 72|baie 70|littoral 80|vacances 48|sirène 55|corail 57|navire 66',
    'soleil': 'lumière 82|chaleur 78|étoile 80|astre 88|lune 70|jour 68|été 72|rayon 77|ciel 66|lever 60|coucher 60|bronzage 58|plage 50|feu 52|brûlure 50|ombre 55|matin 54|aube 60|crépuscule 55|planète 58|éclipse 65|lunettes 42|crème 40|désert 48|tournesol 62|chaud 64|midi 52|univers 45|galaxie 48|clarté 63|sécheresse 45|énergie 50|jaune 55',
    'chat': 'chaton 95|félin 93|minou 92|matou 94|chien 78|souris 70|animal 72|ronronnement 75|griffe 66|moustache 60|lion 62|tigre 60|poil 55|lait 50|croquette 58|litière 64|siamois 80|persan 70|miaulement 82|patte 56|queue 50|oiseau 45|vétérinaire 55|panthère 60|sieste 40|pelote 45|gouttière 48|fourrure 54',
    'école': 'classe 85|élève 84|professeur 82|maître 75|maîtresse 76|enseignant 80|instituteur 85|collège 90|lycée 88|université 70|cartable 72|cahier 65|cours 78|leçon 72|devoir 70|récréation 74|cantine 66|tableau 64|craie 60|examen 66|note 58|bulletin 60|rentrée 70|directeur 62|éducation 76|apprentissage 68|diplôme 60|stylo 52|livre 55|enfant 58|vacances 50|uniforme 52|campus 62|crayon 50',
    'musique': 'chanson 88|mélodie 90|rythme 82|son 72|note 75|instrument 80|piano 72|guitare 74|violon 70|batterie 62|chanteur 75|concert 80|orchestre 82|compositeur 78|partition 76|album 70|disque 65|radio 60|danse 66|jazz 70|rock 68|rap 66|opéra 70|symphonie 82|refrain 74|harmonie 80|festival 58|casque 52|écouteur 50|voix 60|chorale 68|tambour 60|flûte 64|artiste 55|scène 55|oreille 45',
    'pain': 'baguette 90|khobz 92|boulanger 82|boulangerie 85|farine 78|levure 72|croissant 70|brioche 74|mie 76|croûte 74|miette 70|blé 66|beurre 60|tartine 75|sandwich 70|four 58|pâte 64|céréale 50|toast 72|confiture 52|fromage 48|repas 50|nourriture 55|gâteau 55|galette 62|msemen 60|harcha 58|viennoiserie 66|petit déjeuner 55',
    'voiture': 'automobile 96|auto 95|véhicule 90|camion 72|moto 68|bus 60|taxi 72|conducteur 74|chauffeur 72|route 68|autoroute 66|moteur 75|roue 70|pneu 70|volant 76|essence 66|garage 70|parking 72|permis 70|accident 60|vitesse 58|embouteillage 64|frein 66|klaxon 62|carrosserie 70|mécanicien 66|trajet 50|conduite 74|ceinture 50|train 48|avion 40|circulation 60',
    'hiver': 'froid 85|neige 82|décembre 70|janvier 72|février 68|saison 75|automne 80|été 72|printemps 74|glace 70|gel 72|manteau 66|écharpe 64|bonnet 62|pluie 58|noël 62|ski 60|frisson 52|chauffage 60|cheminée 58|grippe 50|rhume 52|vent 50|nuit 40|flocon 70|gant 58|verglas 66|tempête 54|soupe 42',
    'livre': 'roman 88|ouvrage 92|bouquin 94|lecture 82|page 78|auteur 76|écrivain 75|bibliothèque 80|librairie 82|chapitre 78|histoire 64|conte 66|poème 60|dictionnaire 72|cahier 60|magazine 64|journal 58|couverture 62|édition 70|lecteur 74|papier 55|mot 52|texte 64|récit 70|encyclopédie 72|bande dessinée 66|manuel 74|étagère 50|savoir 50|école 55',
    'forêt': 'bois 90|futaie 88|bosquet 85|arbre 84|jungle 82|chêne 70|pin 68|feuille 66|branche 64|champignon 62|bûcheron 66|sentier 58|loup 60|cerf 62|écureuil 60|nature 72|clairière 75|végétation 70|broussaille 62|mousse 55|sapin 66|randonnée 54|chasseur 55|parc 52|montagne 50|feu 48|incendie 55|oiseau 50|hibou 54|campagne 55',
    'feu': 'flamme 92|brasier 90|incendie 88|braise 82|fumée 78|chaleur 72|bois 60|allumette 70|briquet 68|pompier 72|cheminée 66|bougie 64|lumière 58|cendre 70|charbon 64|foyer 70|barbecue 62|brûlure 66|rouge 50|explosion 55|étincelle 76|volcan 58|lave 56|soleil 52|enfer 55|camp 50|eau 45|danger 48|four 50|forêt 45',
    'maison': 'demeure 92|dar 90|habitation 90|logement 88|appartement 84|foyer 82|villa 82|riad 76|immeuble 72|toit 72|porte 66|fenêtre 64|mur 62|chambre 70|salon 70|cuisine 68|jardin 60|famille 64|voisin 55|quartier 58|construction 55|brique 52|clé 50|loyer 62|propriétaire 60|déménagement 66|cabane 70|château 60|palais 58|adresse 50|étage 58',
    'médecin': 'docteur 96|toubib 94|chirurgien 85|hôpital 84|ordonnance 82|clinique 80|infirmier 80|infirmière 80|consultation 80|patient 78|médicament 78|stéthoscope 76|malade 74|dentiste 74|maladie 72|santé 72|soin 72|diagnostic 72|pharmacien 70|urgence 66|pharmacie 66|cabinet 64|guérison 64|vaccin 62|blouse 60|ambulance 60|fièvre 58|sang 50',
    'pluie': 'averse 92|bruine 90|orage 82|déluge 82|nuage 80|parapluie 78|goutte 76|grêle 72|flaque 72|tempête 70|tonnerre 70|inondation 70|neige 68|eau 66|imperméable 66|météo 66|humidité 64|éclair 64|arc en ciel 62|automne 60|ciel 58|hiver 58|gouttière 58|boue 56|vent 55|climat 54',
    'football': 'foot 96|ballon 82|penalty 82|but 80|match 80|stade 78|équipe 76|joueur 76|coup franc 75|gardien 74|arbitre 74|buteur 72|championnat 72|attaquant 72|sport 70|terrain 70|supporter 70|rugby 70|défenseur 70|basket 68|coupe 66|maillot 66|entraîneur 66|handball 66|crampons 66|mondial 66|ligue 64|tennis 60|raja 60|wydad 60',
    'montagne': 'mont 92|sommet 88|pic 84|colline 80|alpinisme 80|escalade 76|altitude 76|crête 76|alpes 74|versant 74|toubkal 74|vallée 72|atlas 72|col 72|falaise 70|randonnée 70|grimpeur 70|rocher 66|volcan 66|neige 64|roche 64|glacier 62|ski 60|plateau 60|chalet 58|sentier 56|cascade 54|forêt 50',
    'téléphone': 'smartphone 94|portable 92|mobile 90|appel 82|sonnerie 76|sms 76|numéro 74|message 72|combiné 72|tablette 72|chargeur 70|whatsapp 70|communication 70|répondeur 68|écran 66|opérateur 66|application 64|ordinateur 64|batterie 62|conversation 60|contact 60|réseau 60|appareil 60|internet 58|selfie 55',
    'café': 'expresso 90|cappuccino 86|caféine 86|cafetière 84|arabica 82|latte 82|nespresso 80|torréfaction 78|tasse 76|thé 72|bistrot 72|boisson 72|grain 70|mug 70|terrasse 66|serveur 62|lait 60|sucre 58|chocolat 58|comptoir 58|petit déjeuner 58|crème 55|machine 55|matin 54|noir 50|croissant 50',
    'lune': 'lunaire 90|satellite 82|astre 80|étoile 74|croissant 72|nuit 72|éclipse 72|soleil 70|astronaute 70|cratère 70|espace 70|planète 66|pleine 66|orbite 66|ciel 64|marée 64|terre 60|fusée 60|ramadan 58|mars 58|galaxie 56|obscurité 55|clair 50|loup 48|rêve 45',
    'avion': 'jet 86|aviateur 86|aéroport 84|vol 82|pilote 82|airbus 82|boeing 82|décollage 80|atterrissage 80|hélicoptère 76|hôtesse 74|aile 72|réacteur 72|passager 70|voyage 70|piste 70|cabine 66|fusée 66|billet 64|drone 64|bagage 62|ciel 60|compagnie 60|train 60|valise 58|bateau 56|voiture 52|nuage 50|oiseau 48',
    'jardin': 'potager 86|jardinier 84|parc 80|verger 78|pelouse 78|fleur 76|plante 76|gazon 76|arrosoir 72|tondeuse 72|haie 70|serre 70|bêche 68|râteau 68|arbre 66|graine 66|cour 66|légume 64|rose 62|terre 60|nature 60|allée 58|maison 55|balcon 55|pot 54|banc 52|abeille 52|papillon 52|oasis 50',
    'argent': 'fric 94|sous 90|monnaie 88|dirham 86|euro 84|dollar 84|fortune 84|billet 82|banque 82|richesse 82|salaire 80|épargne 78|paie 76|pièce 74|portefeuille 74|dépense 72|prix 70|économie 70|crédit 70|dette 70|riche 70|trésor 66|or 66|investissement 66|achat 64|caisse 64|impôt 60|pauvreté 55|carte 55',
    'cheval': 'jument 90|étalon 90|poulain 88|équitation 84|poney 84|cavalier 82|écurie 82|galop 80|hennissement 78|selle 76|crinière 76|âne 74|trot 74|fantasia 74|sabot 72|mulet 72|zèbre 70|calèche 68|foin 66|licorne 62|course 60|rodéo 60|chameau 60|animal 60|cowboy 58|ferme 56|chariot 56|fer 50',
    'mariage': 'noces 92|mariée 88|marié 88|fiançailles 86|union 82|alliance 82|épouse 80|époux 80|mari 76|cérémonie 76|couple 76|negafa 76|amariya 76|lune de miel 74|dot 74|bague 72|divorce 72|henné 72|célébration 70|fête 66|amour 66|témoin 66|robe 64|invité 60|femme 60|famille 58|gâteau 50',
    'ordinateur': 'pc 92|laptop 92|informatique 88|écran 82|processeur 82|clavier 80|logiciel 80|portable 76|souris 74|tablette 74|windows 74|mac 74|programme 72|internet 72|technologie 70|fichier 68|imprimante 66|données 66|code 66|mémoire 64|disque 62|téléphone 62|bureau 60|calcul 60|virus 58|robot 55|câble 55|jeu 50',
    'désert': 'sahara 92|dune 88|sable 84|oasis 82|dromadaire 82|chameau 80|erg 80|sécheresse 76|mirage 76|caravane 76|aride 74|nomade 74|merzouga 74|chaleur 72|cactus 72|touareg 72|reg 72|steppe 70|scorpion 66|soif 66|soleil 64|puits 60|tempête 55|serpent 54|solitude 52|vide 50|eau 50',
    'prison': 'pénitencier 94|geôle 92|prisonnier 88|cachot 88|bagne 88|cellule 86|détenu 86|enfermement 84|captivité 82|évasion 80|barreau 78|gardien 74|condamnation 74|menottes 72|peine 70|crime 70|criminel 70|tribunal 66|police 66|punition 66|sentence 66|juge 64|liberté 64|procès 64|verrou 60|avocat 58|mur 48',
    'roi': 'monarque 94|souverain 92|royaume 88|reine 86|sultan 86|couronne 86|trône 84|prince 82|empereur 82|majesté 80|palais 76|sceptre 76|dynastie 76|princesse 74|château 70|pharaon 70|noble 66|chevalier 64|pouvoir 64|chef 64|président 60|cour 58|échecs 55|lion 50|carte 45',
    'fromage': 'fromager 86|jben 86|camembert 84|mozzarella 84|parmesan 84|gruyère 82|brie 80|emmental 80|roquefort 80|lait 74|raclette 74|chèvre 72|fondue 72|yaourt 66|beurre 66|vache 62|crème 62|pizza 60|pain 55|fermentation 55|plateau 55|souris 52|croûte 50|trou 45',
    'train': 'chemin de fer 90|ferroviaire 90|tgv 88|locomotive 88|gare 86|wagon 86|rail 84|al boraq 80|oncf 80|métro 78|tramway 78|voie 76|quai 74|contrôleur 72|voyageur 66|billet 64|conducteur 64|bus 62|vapeur 60|horaire 58|avion 58|retard 56|voiture 50|valise 50',
    'montre': 'montre connectée 90|smartwatch 88|horloger 86|horloge 84|chronomètre 84|pendule 82|heure 82|rolex 82|réveil 78|cadran 78|aiguille 76|bracelet 76|poignet 74|temps 72|minute 70|seconde 70|sablier 66|bijou 60|alarme 58|pile 56|ponctualité 54|calendrier 52|retard 50',
    'couteau': 'canif 92|poignard 90|lame 88|tranchant 82|couverts 76|fourchette 72|épée 72|cuillère 70|découpe 70|coupure 70|ciseaux 68|boucher 66|arme 66|hache 64|rasoir 64|cuisine 60|scie 60|manche 58|viande 56|blessure 55|assiette 55|pain 45',
    'oiseau': 'moineau 86|pigeon 84|hirondelle 84|colombe 84|plume 82|nid 82|aigle 82|corbeau 82|perroquet 82|aile 80|bec 80|canari 80|cigogne 80|faucon 80|hibou 78|mouette 76|volaille 72|vol 70|poule 70|cage 66|migration 66|chant 64|oeuf 60|ciel 56|avion 48|chat 45',
    'fleur': 'floraison 88|rose 86|pétale 86|fleuriste 86|tulipe 84|marguerite 84|bouquet 84|orchidée 84|jasmin 82|lys 82|coquelicot 82|violette 80|plante 76|bourgeon 76|jardin 72|pollen 72|tige 70|parfum 66|printemps 64|vase 64|abeille 62|feuille 62|épine 58|couronne 55|papillon 55',
    'ciel': 'firmament 92|azur 90|céleste 88|nuage 78|atmosphère 78|étoile 74|horizon 70|espace 70|cosmos 68|soleil 66|paradis 66|univers 66|bleu 64|lune 64|arc en ciel 62|orage 56|oiseau 55|avion 55|pluie 54|aube 52|nuit 52|éclair 52|vent 50',
    'cuisine': 'cuisinier 86|gastronomie 84|recette 82|cuisinière 82|chef 76|casserole 76|marmite 76|plat 74|repas 74|poêle 74|four 72|ustensile 72|tajine 72|nourriture 72|frigo 70|réfrigérateur 70|restaurant 70|épice 66|évier 66|couscous 62|assiette 60|couteau 60|manger 60|table 58|sel 55|gâteau 55|salle 50',
    'plage': 'sable 86|rivage 86|parasol 82|baignade 82|crique 82|littoral 80|mer 78|côte 76|transat 76|château de sable 76|vague 74|bronzage 74|océan 72|vacances 72|sauveteur 72|maillot 70|soleil 70|été 70|surf 70|coquillage 70|baie 70|serviette 66|nageur 66|palmier 64|glace 52',
    'neige': 'flocon 90|poudreuse 88|hiver 82|blizzard 80|avalanche 78|froid 76|glace 74|ski 74|luge 72|déneigement 72|gel 70|grêle 70|pluie 68|bonhomme 66|igloo 66|ifrane 66|blanc 64|montagne 64|verglas 64|tempête 62|noël 56|sapin 50|chute 50',
    'rêve': 'songe 94|rêverie 90|cauchemar 86|sommeil 82|imagination 76|fantasme 76|illusion 72|nuit 70|utopie 70|dormir 66|ambition 66|espoir 66|fantaisie 66|désir 64|souhait 64|vision 64|idéal 64|réveil 60|lit 56|oreiller 54|sieste 54|objectif 52|mémoire 45',
    'guerre': 'bataille 90|conflit 88|combat 86|guérilla 82|armée 82|soldat 82|militaire 78|arme 76|invasion 76|ennemi 74|tranchée 74|paix 72|bombe 72|attaque 72|char 70|front 70|général 68|massacre 68|fusil 68|victoire 66|défaite 66|révolution 66|violence 62|réfugié 60|mort 58|histoire 50',
  };

  function norm(s) {
    s = String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/œ/g, 'oe').replace(/æ/g, 'ae')
      .replace(/[’'\-]/g, ' ').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
    s = s.replace(/^(le|la|les|un|une|des|l|du|de|d) /, '');
    return s.split(' ').map((t) => (t.length > 3 && /[sx]$/.test(t) ? t.slice(0, -1) : t)).join(' ');
  }

  const T = {};
  const display = {};
  for (const k in RAW) {
    const nk = norm(k);
    display[nk] = k;
    T[nk] = {};
    RAW[k].split('|').forEach((e) => {
      const m = e.trim().match(/^(.*\S)\s+(\d+)$/);
      if (m) T[nk][norm(m[1])] = +m[2];
    });
  }

  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  // Proximité entre le mot secret et un indice, de 0 à 100.
  function similarity(secret, word) {
    const a = norm(secret), b = norm(word);
    if (!a || !b) return 0;
    if (a === b) return 100;
    let s = null;
    const d1 = T[a] && T[a][b], d2 = T[b] && T[b][a];
    if (d1 != null || d2 != null) s = Math.max(d1 || 0, d2 || 0);
    if (s == null) {
      // passage par un mot commun
      let best = 0;
      for (const x in T) {
        const xa = x === a ? null : T[x][a] != null ? T[x][a] : (T[a] && T[a][x]);
        const xb = x === b ? null : T[x][b];
        if (xa != null && xb != null) best = Math.max(best, Math.round((xa * xb) / 100 * 0.62));
      }
      if (T[a]) for (const n in T[a]) { if (T[b] && T[b][n] != null) best = Math.max(best, Math.round(Math.min(T[a][n], T[b][n]) * 0.55)); }
      if (best) s = Math.min(best, 58);
    }
    if (s == null) s = 3 + (hash(a + '|' + b) % 20);
    return Math.max(0, Math.min(99, s));
  }

  return {
    secrets: Object.keys(RAW),
    norm,
    similarity,
    same: (a, b) => norm(a) === norm(b),
  };
})();
