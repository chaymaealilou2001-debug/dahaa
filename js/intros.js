'use strict';
// Noms des jeux + affiches d'explication simples, en français / anglais / arabe.
// Chaque ligne : [emoji, français, anglais, arabe]

const INTROS = {
  mot: {
    name: ['Le Mot Secret', 'The Secret Word', 'الكلمة السرية'],
    short: ['Donne des indices, la proximité s’affiche… mais ne te fais pas deviner !', 'Give clues, see how close they are… but don’t get guessed!', 'أعطِ تلميحات وشاهد مدى قربها… لكن لا تدعهم يخمّنون!'],
    goal: ['Fais deviner ton mot secret… mais pas trop vite !', 'Make the others guess your secret word… but not too fast!', 'اجعل الآخرين يخمّنون كلمتك السرية… لكن ليس بسرعة!'],
    steps: [
      ['🔤', 'Choisis un mot secret parmi 5.', 'Pick a secret word out of 5.', 'اختر كلمة سرية من بين 5 كلمات.'],
      ['💡', 'Donne des indices. L’appli montre en % s’ils sont proches de ton mot.', 'Give clues. The app shows in % how close they are to your word.', 'أعطِ تلميحات. التطبيق يُظهر بالنسبة المئوية مدى قربها من كلمتك.'],
      ['✍️', 'Les autres écrivent leur réponse en même temps.', 'The others write their answer at the same time.', 'الآخرون يكتبون جوابهم في نفس الوقت.'],
      ['🏆', 'Ils trouvent : ils gagnent. Personne ne trouve : c’est toi qui gagnes !', 'If they find it, they score. If nobody does, you score!', 'إذا وجدوها يربحون. إذا لم يجدها أحد، أنت من يربح!'],
    ],
    more: [
      ['Les mots du jeu sont en français.', 'The words in this game are in French.', 'كلمات هذه اللعبة بالفرنسية.'],
      ['Jusqu’à 5 indices par tentative. Un indice à 95 % ou plus arrête les indices.', 'Up to 5 clues per attempt. A clue at 95% or more stops the clues.', 'حتى 5 تلميحات في كل محاولة. تلميح بنسبة 95% أو أكثر يوقف التلميحات.'],
      ['3 tentatives par joueur : elles valent 1, 2 puis 3 points.', '3 attempts per player: worth 1, 2, then 3 points.', '3 محاولات لكل لاعب: تساوي 1 ثم 2 ثم 3 نقاط.'],
      ['2 manches. Dans la manche 2, tout compte double.', '2 rounds. In round 2, everything counts double.', 'جولتان. في الجولة الثانية تُضاعف كل النقاط.'],
    ],
  },
  petit: {
    name: ['Le Plus Petit Seul', 'Lowest Alone', 'الأصغر الوحيد'],
    short: ['Le plus petit nombre unique gagne. Bluff et lecture des autres.', 'The lowest unique number wins. Bluff and read the others.', 'أصغر رقم لم يتكرر يفوز. خداع وقراءة للآخرين.'],
    goal: ['Joue le plus petit nombre… que personne d’autre n’a joué.', 'Play the lowest number… that nobody else played.', 'العب أصغر رقم… لم يلعبه أحد غيرك.'],
    steps: [
      ['🃏', 'Tu as des cartes de 1 à 9. Montre 2 cartes à tout le monde.', 'You have cards from 1 to 9. Show 2 cards to everyone.', 'لديك بطاقات من 1 إلى 9. اعرض بطاقتين على الجميع.'],
      ['👀', 'Regarde les cartes des autres, puis retire une des tiennes.', 'Look at the others’ cards, then take back one of yours.', 'انظر إلى بطاقات الآخرين، ثم اسحب واحدة من بطاقتيك.'],
      ['🥇', 'Le plus petit nombre joué par une seule personne gagne.', 'The lowest number played by only one person wins.', 'أصغر رقم لعبه شخص واحد فقط هو الفائز.'],
      ['💰', 'Tu gagnes autant de points que ta carte : un 1 rapporte peu !', 'You score as many points as your card: a 1 is worth little!', 'تربح نقاطًا بقدر رقم بطاقتك: الرقم 1 يعطي نقطة واحدة فقط!'],
    ],
    more: [
      ['7 manches. La carte jouée est perdue, la carte retirée revient dans ta main.', '7 rounds. The played card is lost; the card you took back returns to your hand.', '7 جولات. البطاقة الملعوبة تضيع، والبطاقة المسحوبة تعود إلى يدك.'],
      ['Si tous les nombres sont en double, personne ne marque.', 'If every number is doubled, nobody scores.', 'إذا تكررت كل الأرقام، لا أحد يربح نقاطًا.'],
    ],
  },
  tiens: {
    name: ['Tiens Bon', 'Hold On', 'اصمد'],
    short: ['Une enchère où l’on paie avec son temps. Qui lâchera en premier ?', 'An auction paid with your time. Who will let go first?', 'مزاد تدفع فيه من وقتك. من سيترك الزر أولًا؟'],
    goal: ['Garde le doigt appuyé plus longtemps que les autres.', 'Keep your finger down longer than the others.', 'أبقِ إصبعك على الزر أطول من الآخرين.'],
    steps: [
      ['⏱️', 'Tu as 60 secondes de réserve pour toute la partie.', 'You have 60 seconds in reserve for the whole game.', 'لديك 60 ثانية فقط لكل اللعبة.'],
      ['👆', 'Tout le monde appuie sur le bouton. Lâche avant le départ si tu veux passer.', 'Everyone presses the button. Let go before the start if you want to skip.', 'الجميع يضغط على الزر. اتركه قبل البداية إذا لم ترد اللعب في هذه الجولة.'],
      ['⌛', 'Le dernier qui tient gagne 1 jeton… mais chaque seconde est perdue !', 'The last one holding wins 1 token… but every second is spent!', 'آخر من يبقى ضاغطًا يربح قطعة… لكن كل ثانية تُخصم من وقتك!'],
      ['🏆', 'Le plus de jetons gagne.', 'Most tokens wins.', 'صاحب أكثر القطع هو الفائز.'],
    ],
    more: [
      ['7 manches. Si ta réserve tombe à 0, tu lâches automatiquement.', '7 rounds. If your reserve hits 0, you let go automatically.', '7 جولات. إذا نفد وقتك تترك الزر تلقائيًا.'],
      ['Égalité de jetons : la plus grosse réserve restante gagne.', 'Tie on tokens: the biggest remaining reserve wins.', 'عند التعادل: يفوز من بقي لديه وقت أكثر.'],
    ],
  },
  menteur: {
    name: ['Le Menteur', 'The Liar', 'الكذّاب'],
    short: ['Annonce combien de cartes d’une couleur il y a en tout… ou démasque le menteur.', 'Bid how many cards of a colour there are in total… or call out the liar.', 'أعلن كم بطاقة من لون معيّن عند الجميع… أو اكشف الكذّاب.'],
    goal: ['Devine combien de cartes d’une couleur il y a… ou démasque le menteur !', 'Guess how many cards of a colour there are… or catch the liar!', 'خمّن كم بطاقة من لون معيّن عند الجميع… أو اكشف الكذّاب!'],
    steps: [
      ['🎴', 'Tu as 5 cartes de couleur cachées. ★ compte pour toutes les couleurs.', 'You have 5 hidden colour cards. ★ counts as every colour.', 'لديك 5 بطاقات ملوّنة مخفية. ★ تُحسب لكل الألوان.'],
      ['📢', 'Annonce par exemple : « au moins 3 rouges » chez tout le monde.', 'Bid for example: “at least 3 reds” among everyone.', 'أعلن مثلًا: «على الأقل 3 حمراء» عند الجميع.'],
      ['⬆️', 'Le suivant annonce un nombre plus grand… ou crie « Menteur ! ».', 'The next player bids a higher number… or shouts “Liar!”.', 'اللاعب التالي يعلن رقمًا أكبر… أو يصرخ «كذّاب!».'],
      ['❌', 'Celui qui a tort perd une carte. Le dernier en jeu gagne.', 'Whoever is wrong loses a card. The last one in wins.', 'من يخطئ يخسر بطاقة. آخر لاعب يبقى هو الفائز.'],
    ],
    more: [
      ['Celui qui a perdu commence la manche suivante. On redistribue les cartes.', 'The loser starts the next round. Cards are dealt again.', 'الخاسر يبدأ الجولة التالية. تُوزَّع البطاقات من جديد.'],
    ],
  },
  nitrop: {
    name: ['Ni Trop Ni Peu', 'Not Too Much', 'لا أكثر ولا أقل'],
    short: ['Approche-toi de la limite sans la dépasser… et mise sur ta main.', 'Get close to the limit without going over… and bet on your hand.', 'اقترب من الحدّ دون تجاوزه… وراهن على يدك.'],
    goal: ['Approche-toi de la limite sans la dépasser.', 'Get close to the limit without going over.', 'اقترب من الحدّ دون أن تتجاوزه.'],
    steps: [
      ['🎲', 'Un dé donne la limite : entre 5 et 12.', 'A die sets the limit: between 5 and 12.', 'النرد يحدّد الحدّ: بين 5 و12.'],
      ['🃏', 'Tu as 3 cartes et tu en montres une.', 'You have 3 cards and you show one.', 'لديك 3 بطاقات وتُظهر واحدة منها.'],
      ['🪙', 'Mise des jetons, puis prends une carte de plus ou reste.', 'Bet tokens, then take one more card or stay.', 'راهن بالقطع، ثم خذ بطاقة إضافية أو توقّف.'],
      ['🏆', 'Le plus proche de la limite gagne les jetons. Dépasser = perdu !', 'Closest to the limit wins the tokens. Going over = you lose!', 'الأقرب إلى الحدّ يربح القطع. التجاوز = خسارة!'],
    ],
    more: [
      ['30 jetons au départ. Cartes : 7, 6, 5, 4, 3, 2, 1 et −1.', '30 tokens to start. Cards: 7, 6, 5, 4, 3, 2, 1 and −1.', '30 قطعة في البداية. البطاقات: 7، 6، 5، 4، 3، 2، 1 و−1.'],
      ['On ne peut pas miser plus que les jetons du joueur le plus pauvre.', 'You can’t bet more than the poorest player’s tokens.', 'لا يمكن المراهنة بأكثر مما يملكه أفقر لاعب.'],
      ['Égalité : le plus de cartes gagne. Plus de jetons = éliminé.', 'Tie: most cards wins. No tokens left = out.', 'عند التعادل: صاحب البطاقات الأكثر يفوز. من نفدت قطعه يخرج.'],
      ['Après 25 mains, le joueur le plus riche gagne.', 'After 25 hands, the richest player wins.', 'بعد 25 يدًا، يفوز اللاعب الأغنى.'],
    ],
  },
  degrade: {
    name: ['Dégradé', 'Gradient', 'التدرّج'],
    short: ['Duels de chiffres cachés. La couleur de la boîte trahit un peu ton jeu.', 'Hidden number duels. The box colour gives a little away.', 'مبارزات بأرقام مخفية. لون العلبة يكشف شيئًا من لعبك.'],
    goal: ['Gagne les duels avec tes chiffres cachés.', 'Win duels with your hidden numbers.', 'اربح المبارزات بأرقامك المخفية.'],
    steps: [
      ['🔢', 'Range 7 chiffres du plus petit au plus grand (total 30 maximum).', 'Place 7 digits from smallest to largest (total 30 max).', 'رتّب 7 أرقام من الأصغر إلى الأكبر (المجموع 30 كحدّ أقصى).'],
      ['🎨', 'Chaque boîte a une couleur : noir au bord, blanc au milieu.', 'Each box has a colour: black at the edges, white in the middle.', 'لكل علبة لون: الأسود على الأطراف والأبيض في الوسط.'],
      ['⚔️', 'Pose une boîte : l’autre voit seulement sa couleur. Le plus grand chiffre gagne.', 'Play a box: your opponent only sees its colour. Highest digit wins.', 'ضع علبة: الخصم يرى لونها فقط. الرقم الأكبر يربح.'],
      ['🏆', 'Gagne 2 duels de suite pour remporter la partie.', 'Win 2 duels in a row to win the game.', 'اربح مبارزتين متتاليتين لتفوز باللعبة.'],
    ],
    more: [
      ['Chaque chiffre au maximum 2 fois. 7 manches par duel, égalité = on rejoue.', 'Each digit at most twice. 7 rounds per duel; a tie is replayed.', 'كل رقم مرتين على الأكثر. 7 جولات في كل مبارزة، والتعادل يُعاد.'],
      ['Le gagnant reste et affronte le joueur suivant.', 'The winner stays and faces the next player.', 'الفائز يبقى ويواجه اللاعب التالي.'],
    ],
  },
  pyramide: {
    name: ['Pyramide', 'Pyramid', 'الهرم'],
    short: ['Calcul rapide : combine 3 tuiles pour atteindre la cible avant les autres.', 'Quick maths: combine 3 tiles to hit the target before the others.', 'حساب سريع: اجمع 3 مربعات لتصل إلى الرقم قبل الآخرين.'],
    goal: ['Trouve des calculs qui donnent le nombre cible.', 'Find calculations that make the target number.', 'جِد عمليات حسابية تعطي الرقم المطلوب.'],
    steps: [
      ['🎯', 'Un nombre cible s’affiche.', 'A target number appears.', 'يظهر رقم مطلوب.'],
      ['🔺', 'Choisis 3 tuiles dans l’ordre : le chiffre de la 1re, puis les calculs des 2 autres.', 'Pick 3 tiles in order: the number of the 1st, then the operations of the other 2.', 'اختر 3 مربعات بالترتيب: رقم الأول، ثم عمليات المربعين الآخرين.'],
      ['✅', 'Juste = +1 point. Faux = −1 point.', 'Right = +1 point. Wrong = −1 point.', 'صحيح = +1 نقطة. خطأ = −1 نقطة.'],
      ['🙅', '« Plus rien ! » quand il ne reste aucune solution : +3.', '“None left!” when there are no solutions left: +3.', '«لا يوجد المزيد!» عندما لا يبقى أي حل: +3.'],
    ],
    more: [
      ['Exemple : A = +3, D = ×2, G = −1 → 3 × 2 − 1 = 5.', 'Example: A = +3, D = ×2, G = −1 → 3 × 2 − 1 = 5.', 'مثال: A = ‎+3، D = ‎×2، G = ‎−1 ← 3 × 2 − 1 = 5.'],
      ['Une combinaison déjà trouvée compte comme fausse. Une division doit tomber juste.', 'A combination already found counts as wrong. Divisions must be exact.', 'التركيبة التي وُجدت سابقًا تُحسب خطأ. القسمة يجب أن تكون بدون باقٍ.'],
      ['5 manches, une nouvelle pyramide à chaque fois. Faux « Plus rien ! » = −1.', '5 rounds, a new pyramid each time. A wrong “None left!” = −1.', '5 جولات، وهرم جديد في كل مرة. «لا يوجد المزيد!» الخاطئ = −1.'],
    ],
  },
  balance: {
    name: ['Balance 13', 'Scale 13', 'ميزان 13'],
    short: ['Pose tes poids en secret… et laisse les autres casser la balance.', 'Place your weights in secret… and let the others break the scale.', 'ضع أوزانك سرًّا… واترك الآخرين يكسرون الميزان.'],
    goal: ['Ne sois pas là quand la balance casse !', 'Don’t be there when the scale breaks!', 'لا تكن موجودًا عندما ينكسر الميزان!'],
    steps: [
      ['⚖️', 'Il y a 3 balances.', 'There are 3 scales.', 'هناك 3 موازين.'],
      ['🤫', 'Chacun pose en secret un poids (0 à 5) sur une balance.', 'Everyone secretly puts a weight (0 to 5) on a scale.', 'كل لاعب يضع سرًّا وزنًا (من 0 إلى 5) على ميزان.'],
      ['💥', 'À 13 ou plus, la balance casse : ceux qui ont posé dessus prennent une pénalité.', 'At 13 or more the scale breaks: everyone who added to it gets a penalty.', 'عند 13 أو أكثر ينكسر الميزان: من وضع عليه يأخذ عقوبة.'],
      ['🏆', 'Le moins de pénalités gagne.', 'Fewest penalties wins.', 'صاحب أقل عدد من العقوبات هو الفائز.'],
    ],
    more: [
      ['Celui qui a posé le plus lourd sur une balance cassée prend une pénalité de plus.', 'Whoever put the heaviest weight on a broken scale gets one more penalty.', 'من وضع الوزن الأثقل على ميزان مكسور يأخذ عقوبة إضافية.'],
      ['12 tours. Quand ta main est vide, tu récupères tous tes poids.', '12 turns. When your hand is empty, you get all your weights back.', '12 دورًا. عندما تفرغ يدك تستعيد كل أوزانك.'],
    ],
  },
  dejavu: {
    name: ['Déjà Vu', 'Déjà Vu', 'رأيتها من قبل'],
    short: ['Des images défilent : appuie dès qu’une image revient. Mémoire et réflexes !', 'Pictures scroll by: tap as soon as one comes back. Memory and reflexes!', 'تمرّ صور: اضغط فور عودة صورة. ذاكرة وسرعة!'],
    goal: ['Repère les images qui reviennent.', 'Spot the pictures that come back.', 'اكتشف الصور التي تتكرّر.'],
    steps: [
      ['👀', 'Des images défilent sur tous les téléphones en même temps.', 'Pictures scroll on every phone at the same time.', 'تمرّ صور على كل الهواتف في نفس الوقت.'],
      ['🔁', 'Une image déjà vue revient ? Appuie vite sur le bouton.', 'A picture you’ve seen comes back? Tap the button fast.', 'عادت صورة رأيتها من قبل؟ اضغط على الزر بسرعة.'],
      ['✅', 'Juste = +1, erreur = −1. Ça va de plus en plus vite !', 'Right = +1, wrong = −1. It gets faster and faster!', 'صحيح = +1، خطأ = −1. السرعة تزداد في كل جولة!'],
    ],
    more: [['3 manches.', '3 rounds.', '3 جولات.']],
  },
};

// Enregistre les noms et descriptions des jeux comme textes traduits
(() => {
  const L = { fr: 0, en: 1, ar: 2 };
  const out = { fr: {}, en: {}, ar: {} };
  for (const id in INTROS) for (const l in L) { out[l][id + '.name'] = INTROS[id].name[L[l]]; out[l][id + '.short'] = INTROS[id].short[L[l]]; }
  addStrings(out);
})();

// HTML de l'affiche d'un jeu dans la langue choisie. withMore = ajoute les détails.
function posterHtml(id, withMore) {
  const G = GAMES[id], I = INTROS[id];
  const k = { fr: 1, en: 2, ar: 3 }[I18N.lang];
  const m = k - 1;
  return `<div class="poster">
    <div class="phead"><div class="pemo">${G.emoji}</div><div class="pname">${esc(gName(id))}</div>
      <div class="pgoal">${esc(I.goal[m])}</div></div>
    <ol class="psteps">${I.steps.map((s, i) => `<li><span class="pico">${s[0]}</span><span><b>${i + 1}.</b> ${esc(s[k])}</span></li>`).join('')}</ol>
    ${I.more && I.more.length ? `<details class="more" ${withMore ? 'open' : ''}><summary>${t('more')}</summary><ul>${I.more.map((x) => `<li>${esc(x[m])}</li>`).join('')}</ul></details>` : ''}
  </div>`;
}
