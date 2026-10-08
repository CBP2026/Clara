// Conteúdo da Clara: perguntas por nível, falas da companheira, Novelinha e figurinhas.
// Usado no celular (window.CONTEUDO) e no servidor (require) para os textos das notificações e do painel.
// Marcadores: {nome} = nome dela, {lua} = nome da companheira, {novela}, {influ}, {academia}, {faixa}, {proxima}.
(function (root) {
  const C = {};

  C.mundos = {
    math: {
      nome: "Números", emoji: "🍎",
      niveis: [
        "Contar até 20, comparar grupos, número seguinte",
        "Somar e tirar até 20 (figurinhas, pontos do jiu-jitsu)",
        "Dinheiro: somar preços e calcular troco em euros",
        "Multiplicação como grupos iguais (tabuada do 2, 3, 4, 5 e 10)",
        "Metade, dobro e descontos simples (50%, 10%, 25%)",
        "Descobrir o número que falta (? + 7 = 15)",
        "Proporção do dia a dia (receitas, preço de vários itens)"
      ]
    },
    time: {
      nome: "Tempo", emoji: "🌅",
      niveis: [
        "Partes do dia, primeiro / depois, agora",
        "Dias da semana, meses, estações, cedo e tarde",
        "Ler o relógio de ponteiros (hora certa e meia hora)",
        "Quanto falta e quanto dura (minutos e horas)",
        "Planejar a tarde: horários, ordem das tarefas"
      ]
    },
    en: {
      nome: "English", emoji: "💬",
      niveis: [
        "Palavras úteis do dia a dia",
        "Frases curtas (escola, treino, cumprimentos)",
        "Mini-diálogos: escolher a resposta certa",
        "Responder numa conversa real em inglês"
      ]
    },
    soc: {
      nome: "Amigos", emoji: "🤝",
      niveis: [
        "Regras básicas de convivência (oi, esperar a vez, pedir)",
        "Ler emoções e sinais do corpo dos outros",
        "Escola nova: entrar num grupo, comentários chatos, pedir ajuda",
        "Manter uma conversa com colegas da idade"
      ]
    },
    nov: { nome: "Novelinha", emoji: "📺", niveis: [] },
    music: { nome: "Música", emoji: "🎵", niveis: [] }
  };

  // ---------------- English ----------------
  C.words = [
    { en: "hello", pt: "olá", emoji: "👋" },
    { en: "please", pt: "por favor", emoji: "🙏" },
    { en: "thank you", pt: "obrigada", emoji: "💛" },
    { en: "sorry", pt: "desculpa", emoji: "🙂" },
    { en: "friend", pt: "amigo", emoji: "🤝" },
    { en: "water", pt: "água", emoji: "💧" },
    { en: "help", pt: "ajuda", emoji: "🆘" },
    { en: "yes", pt: "sim", emoji: "✅" },
    { en: "no", pt: "não", emoji: "🚫" },
    { en: "stop", pt: "para", emoji: "✋" },
    { en: "wait", pt: "espera", emoji: "⏳" },
    { en: "happy", pt: "feliz", emoji: "😊" },
    { en: "sad", pt: "triste", emoji: "😢" },
    { en: "school", pt: "escola", emoji: "🏫" },
    { en: "home", pt: "casa", emoji: "🏠" },
    { en: "good morning", pt: "bom dia", emoji: "☀️" },
    { en: "good night", pt: "boa noite", emoji: "🌙" },
    { en: "eat", pt: "comer", emoji: "🍽️" },
    { en: "drink", pt: "beber", emoji: "🥤" },
    { en: "book", pt: "livro", emoji: "📖" },
    { en: "dog", pt: "cachorro", emoji: "🐶" },
    { en: "cat", pt: "gato", emoji: "🐱" },
    { en: "red", pt: "vermelho", emoji: "🟥" },
    { en: "blue", pt: "azul", emoji: "🟦" },
    { en: "big", pt: "grande", emoji: "🐘" },
    { en: "small", pt: "pequeno", emoji: "🐜" },
    { en: "mother", pt: "mãe", emoji: "👩" },
    { en: "bathroom", pt: "banheiro", emoji: "🚻" },
    { en: "excuse me", pt: "com licença", emoji: "🙋" },
    { en: "I don't understand", pt: "não entendi", emoji: "🤷" },
    { en: "belt", pt: "faixa", emoji: "🥋" },
    { en: "train", pt: "treinar", emoji: "💪" },
    { en: "teacher", pt: "professora", emoji: "👩‍🏫" },
    { en: "phone", pt: "celular", emoji: "📱" },
    { en: "music", pt: "música", emoji: "🎵" }
  ];

  // Nível 2: frases curtas
  C.frases = [
    { en: "How are you?", pt: "Como você está?", emoji: "🙂" },
    { en: "I'm fine, thanks.", pt: "Estou bem, obrigada.", emoji: "👍" },
    { en: "What's your name?", pt: "Qual é o seu nome?", emoji: "🏷️" },
    { en: "My name is Clara.", pt: "Meu nome é Clara.", emoji: "🙋" },
    { en: "Nice to meet you.", pt: "Prazer em te conhecer.", emoji: "🤝" },
    { en: "See you tomorrow!", pt: "Até amanhã!", emoji: "👋" },
    { en: "Can I sit here?", pt: "Posso sentar aqui?", emoji: "🪑" },
    { en: "Can you help me?", pt: "Você pode me ajudar?", emoji: "🆘" },
    { en: "I like your shoes.", pt: "Gostei do seu tênis.", emoji: "👟" },
    { en: "Good training!", pt: "Bom treino!", emoji: "🥋" },
    { en: "Thank you, professor.", pt: "Obrigada, professor.", emoji: "🙇" },
    { en: "Do you want to train with me?", pt: "Quer treinar comigo?", emoji: "🤼" },
    { en: "I'm hungry.", pt: "Estou com fome.", emoji: "🍕" },
    { en: "I'm tired.", pt: "Estou cansada.", emoji: "😴" },
    { en: "What time is it?", pt: "Que horas são?", emoji: "🕒" },
    { en: "I don't know.", pt: "Eu não sei.", emoji: "🤷" },
    { en: "Let's go!", pt: "Vamos!", emoji: "🚀" },
    { en: "Happy birthday!", pt: "Feliz aniversário!", emoji: "🎂" },
    { en: "I love this song.", pt: "Eu amo essa música.", emoji: "🎶" },
    { en: "Where is the classroom?", pt: "Onde fica a sala de aula?", emoji: "🏫" }
  ];

  // Nível 3: alguém fala em inglês; ela escolhe a resposta
  C.dialogos = [
    { diz: "Hi! What's your name?", pt: "Oi! Qual é o seu nome?", certo: "My name is Clara.", errados: ["I'm hungry.", "Good night!"] },
    { diz: "How are you?", pt: "Como você está?", certo: "I'm fine, thank you!", errados: ["I'm a dog.", "It's blue."] },
    { diz: "Do you like music?", pt: "Você gosta de música?", certo: "Yes, I love music!", errados: ["It's 3 o'clock.", "My name is music."] },
    { diz: "Can I sit here?", pt: "Posso sentar aqui?", certo: "Sure, sit down!", errados: ["I'm tired.", "Good morning, dog."] },
    { diz: "Thank you!", pt: "Obrigado!", certo: "You're welcome!", errados: ["Goodbye, water.", "I don't like you."] },
    { diz: "See you tomorrow!", pt: "Até amanhã!", certo: "See you! Bye!", errados: ["I'm hungry.", "Yes, it's red."] },
    { diz: "Good training today!", pt: "Bom treino hoje!", certo: "Thanks! You too!", errados: ["I want water now!", "No, it's Monday."] },
    { diz: "What's your favorite color?", pt: "Qual é a sua cor favorita?", certo: "My favorite color is pink.", errados: ["I'm fifteen.", "Yes, please."] },
    { diz: "How old are you?", pt: "Quantos anos você tem?", certo: "I'm fifteen.", errados: ["I'm blue.", "Thank you, teacher."] },
    { diz: "Sorry, I'm late!", pt: "Desculpa, me atrasei!", certo: "No problem!", errados: ["Happy birthday!", "I'm a cat."] },
    { diz: "Do you want to play?", pt: "Você quer jogar?", certo: "Yes! Let's play!", errados: ["It's 8 o'clock.", "My mother is big."] },
    { diz: "Excuse me, where is the bathroom?", pt: "Com licença, onde fica o banheiro?", certo: "It's over there.", errados: ["I like pizza.", "Good night!"] }
  ];

  // Nível 4: situação real; escolher a melhor resposta em inglês
  C.conversa = [
    { sit: "Uma aluna de intercâmbio sorri para você no intervalo.", diz: "Hi! I'm new here.", certo: "Hi! I'm Clara. Welcome!", errados: ["Go away.", "Yes, it's Tuesday."], why: "Dizer o nome e dar boas-vindas abre a conversa." },
    { sit: "A colega mostra um desenho que fez.", diz: "Look! I made this.", certo: "Wow, it's beautiful!", errados: ["I'm hungry.", "Mine is better."], why: "Elogiar faz a pessoa se sentir bem." },
    { sit: "Você não entendeu o que a professora disse.", diz: "Open your books on page ten.", certo: "Sorry, can you repeat, please?", errados: ["No!", "I like dogs."], why: "Pedir para repetir é educado e normal." },
    { sit: "No treino, um parceiro novo chega perto.", diz: "Do you want to train with me?", certo: "Yes! Let's train!", errados: ["I don't like you.", "It's raining."], why: "Aceitar com alegria cria parceria." },
    { sit: "A colega diz que está triste.", diz: "I'm sad today.", certo: "Oh no. Are you okay?", errados: ["Ha ha ha!", "I'm happy, bye!"], why: "Perguntar se está bem mostra cuidado." },
    { sit: "Alguém te convida para o lanche.", diz: "Do you want to eat with us?", certo: "Yes, thank you!", errados: ["Stop talking.", "My bag is blue."], why: "Aceitar e agradecer é perfeito." },
    { sit: "Você esbarrou em alguém sem querer.", diz: "Ouch!", certo: "Oh, sorry! Are you okay?", errados: ["Your fault!", "Good morning!"], why: "Pedir desculpa mostra que foi sem querer." },
    { sit: "A colega fala da série que ela gosta.", diz: "I love this series!", certo: "Cool! What's it about?", errados: ["Boring.", "I'm fifteen."], why: "Perguntar sobre o que ela gosta mantém a conversa." },
    { sit: "É o fim da aula e todos vão embora.", diz: "Bye, Clara!", certo: "Bye! See you tomorrow!", errados: ["Wait, I'm hungry.", "No."], why: "Despedir-se com 'até amanhã' é simpático." },
    { sit: "Uma amiga faz aniversário.", diz: "It's my birthday today!", certo: "Happy birthday!", errados: ["Good night.", "So what?"], why: "Parabenizar deixa o dia dela mais feliz." }
  ];

  // ---------------- Tempo (itens fixos; níveis 3 e 4 também têm gerador no app) ----------------
  C.tempo = [
    // nível 1
    { n: 1, q: "O sol está subindo.", stage: "🌅", hint: "Que parte do dia é?", choices: [
      { t: "Manhã", ok: true, why: "Sol subindo = manhã." },
      { t: "Noite", ok: false, why: "À noite o sol não está subindo." },
      { t: "Meia-noite", ok: false, why: "Meia-noite é o meio da noite, tudo escuro." }] },
    { n: 1, q: "Você já jantou. Está escuro. Você vai dormir.", stage: "🌙", hint: "Que parte do dia é?", choices: [
      { t: "Noite", ok: true, why: "Depois do jantar e escuro = noite." },
      { t: "Manhã", ok: false, why: "De manhã você ainda não jantou." }] },
    { n: 1, q: "Primeiro você lava as mãos. Depois come.", stage: "🧼🍽️", hint: "O que acontece primeiro?", choices: [
      { t: "Lavar as mãos", ok: true, why: "Primeiro é o que vem antes." },
      { t: "Comer", ok: false, why: "Comer vem depois." }] },
    { n: 1, q: "A mãe diz: já vamos, daqui a pouco.", stage: "🚪", hint: "Daqui a pouco quer dizer...", choices: [
      { t: "Esperar pouco", ok: true, why: "Daqui a pouco = espera curta." },
      { t: "Semana que vem", ok: false, why: "Semana que vem é muito mais longe." },
      { t: "Nunca", ok: false, why: "Não é nunca. É esperar um pouquinho." }] },
    { n: 1, q: "O trem sai agora.", stage: "🚆", hint: "Agora quer dizer...", choices: [
      { t: "Neste momento", ok: true, why: "Agora = já, neste instante." },
      { t: "Amanhã", ok: false, why: "Amanhã é outro dia." },
      { t: "No ano passado", ok: false, why: "O ano passado já foi." }] },
    { n: 1, q: "Primeiro você veste o kimono. Depois entra no tatame.", stage: "🥋", hint: "O que vem depois?", choices: [
      { t: "Entrar no tatame", ok: true, why: "Depois do kimono, o tatame." },
      { t: "Vestir o kimono", ok: false, why: "O kimono vem primeiro." }] },
    { n: 1, q: "É meio-dia e você está com fome.", stage: "🍲", hint: "Que refeição é essa?", choices: [
      { t: "Almoço", ok: true, why: "Ao meio-dia é hora do almoço." },
      { t: "Café da manhã", ok: false, why: "O café da manhã é cedo." },
      { t: "Jantar", ok: false, why: "O jantar é à noite." }] },
    { n: 1, q: "Ela tomou café, escovou os dentes e foi para a escola.", stage: "🏫", hint: "O que veio por último?", choices: [
      { t: "Foi para a escola", ok: true, why: "O último da lista é a escola." },
      { t: "Tomou café", ok: false, why: "Tomar café foi o primeiro." },
      { t: "Escovou os dentes", ok: false, why: "Escovar foi o do meio." }] },
    // nível 2
    { n: 2, q: "Hoje é segunda-feira. Que dia vem amanhã?", stage: "📅", hint: "Pense na ordem da semana.", choices: [
      { t: "Terça-feira", ok: true, why: "Depois da segunda vem a terça." },
      { t: "Domingo", ok: false, why: "Domingo vem antes da segunda." },
      { t: "Quarta-feira", ok: false, why: "Quarta vem depois da terça." }] },
    { n: 2, q: "Ontem foi domingo. Que dia é hoje?", stage: "📅", hint: "Hoje vem depois de ontem.", choices: [
      { t: "Segunda-feira", ok: true, why: "Depois do domingo vem a segunda." },
      { t: "Sábado", ok: false, why: "Sábado vem antes do domingo." },
      { t: "Terça-feira", ok: false, why: "Terça vem dois dias depois." }] },
    { n: 2, q: "Quantos dias tem uma semana?", stage: "🗓️", hint: "Segunda, terça, quarta...", choices: [
      { t: "7 dias", ok: true, why: "A semana tem 7 dias." },
      { t: "5 dias", ok: false, why: "5 são só os dias de aula." },
      { t: "10 dias", ok: false, why: "10 dias é mais que uma semana." }] },
    { n: 2, q: "Depois do inverno vem uma estação.", stage: "🌸", hint: "Qual é ela?", choices: [
      { t: "Primavera", ok: true, why: "Depois do inverno vem a primavera." },
      { t: "Outono", ok: false, why: "O outono vem antes do inverno." },
      { t: "Verão", ok: false, why: "O verão vem depois da primavera." }] },
    { n: 2, q: "A escola começa às 9. Você chega às 8.", stage: "🏫", hint: "Você chegou...", choices: [
      { t: "Cedo", ok: true, why: "Antes da hora = cedo." },
      { t: "Tarde", ok: false, why: "Tarde é depois da hora." },
      { t: "Ao mesmo tempo", ok: false, why: "8 é antes de 9." }] },
    { n: 2, q: "O treino começa às 18:00. Você chega às 18:20.", stage: "🥋", hint: "Você chegou...", choices: [
      { t: "Atrasada", ok: true, why: "Depois da hora = atrasada." },
      { t: "Cedo", ok: false, why: "Cedo seria antes das 18:00." },
      { t: "Na hora certa", ok: false, why: "Na hora certa seria às 18:00." }] },
    { n: 2, q: "Que mês vem depois de março?", stage: "🗓️", hint: "Janeiro, fevereiro, março...", choices: [
      { t: "Abril", ok: true, why: "Depois de março vem abril." },
      { t: "Fevereiro", ok: false, why: "Fevereiro vem antes de março." },
      { t: "Junho", ok: false, why: "Junho vem mais tarde." }] },
    { n: 2, q: "Quantos meses tem um ano?", stage: "📆", hint: "De janeiro a dezembro.", choices: [
      { t: "12 meses", ok: true, why: "O ano tem 12 meses." },
      { t: "7 meses", ok: false, why: "7 são os dias da semana." },
      { t: "30 meses", ok: false, why: "30 são os dias de um mês." }] },
    { n: 2, q: "Natal é em dezembro. Que estação é em Portugal?", stage: "🎄", hint: "Faz frio.", choices: [
      { t: "Inverno", ok: true, why: "Em Portugal, dezembro é inverno." },
      { t: "Verão", ok: false, why: "O verão é em julho e agosto." }] },
    { n: 2, q: "Sábado e domingo são...", stage: "🛋️", hint: "Não tem aula.", choices: [
      { t: "Fim de semana", ok: true, why: "Sábado e domingo = fim de semana." },
      { t: "Dias de aula", ok: false, why: "Aula é de segunda a sexta." }] },
    // nível 4
    { n: 4, q: "O filme dura 2 horas. Ele começou às 3.", stage: "🎬", hint: "A que horas ele termina?", choices: [
      { t: "Às 5", ok: true, why: "3 mais 2 horas dá 5." },
      { t: "Às 4", ok: false, why: "Às 4 só passou 1 hora." },
      { t: "Às 6", ok: false, why: "Às 6 teriam passado 3 horas." }] },
    { n: 4, q: "Quanto tempo demora para escovar os dentes?", stage: "🪥", hint: "Pense no dia a dia.", choices: [
      { t: "Uns 2 minutos", ok: true, why: "Escovar leva uns 2 minutos." },
      { t: "Uma hora", ok: false, why: "Uma hora é tempo demais." },
      { t: "Um dia inteiro", ok: false, why: "Um dia tem 24 horas." }] },
    { n: 4, q: "Uma luta de jiu-jitsu dura 4 minutos. Já passaram 3.", stage: "⏱️🥋", hint: "Quanto falta?", choices: [
      { t: "1 minuto", ok: true, why: "4 menos 3 = 1 minuto." },
      { t: "3 minutos", ok: false, why: "3 é o que já passou." },
      { t: "7 minutos", ok: false, why: "7 seria somar, não tirar." }] },
    { n: 4, q: "O aniversário dela é em dezembro. Agora é janeiro.", stage: "🎂", hint: "Falta pouco ou muito?", choices: [
      { t: "Falta muito", ok: true, why: "De janeiro a dezembro são 11 meses." },
      { t: "Falta pouco", ok: false, why: "Pouco seria uns dias." },
      { t: "É hoje", ok: false, why: "Hoje é janeiro." }] },
    { n: 4, q: "Você dorme às 22:00 e acorda às 7:00.", stage: "😴", hint: "Quantas horas dormiu?", choices: [
      { t: "9 horas", ok: true, why: "De 22 a 7 são 9 horas." },
      { t: "7 horas", ok: false, why: "Conte: 23, 24, 1, 2... até 7. São 9." },
      { t: "15 horas", ok: false, why: "15 horas é demais." }] },
    { n: 4, q: "Um episódio tem 30 minutos. Você vê 2 episódios.", stage: "📺", hint: "Quanto tempo no total?", choices: [
      { t: "1 hora", ok: true, why: "30 + 30 = 60 minutos = 1 hora." },
      { t: "30 minutos", ok: false, why: "30 é só um episódio." },
      { t: "2 horas", ok: false, why: "2 horas seriam 4 episódios." }] },
    // nível 5
    { n: 5, q: "A prova é amanhã. Quando é bom estudar?", stage: "📝", hint: "Pense no tempo que falta.", choices: [
      { t: "Hoje", ok: true, why: "Hoje ainda dá tempo." },
      { t: "Semana passada", ok: false, why: "A semana passada já foi." },
      { t: "Depois da prova", ok: false, why: "Depois da prova não ajuda mais." }] },
    { n: 5, q: "O treino é às 18:00. Você leva 20 minutos até a {academia}.", stage: "🚶‍♀️🥋", hint: "A que horas você sai de casa?", choices: [
      { t: "17:40", ok: true, why: "18:00 menos 20 minutos = 17:40." },
      { t: "18:00", ok: false, why: "Saindo às 18:00 você chega atrasada." },
      { t: "18:20", ok: false, why: "18:20 é depois do treino começar." }] },
    { n: 5, q: "Você tem TPC, banho e jantar antes das 21:00.", stage: "📚🚿🍽️", hint: "O que fazer primeiro, se o jantar é às 20:00?", choices: [
      { t: "TPC agora, banho, depois jantar", ok: true, why: "Fazer o TPC cedo deixa a noite livre." },
      { t: "Ver vídeos até às 21:00", ok: false, why: "Assim não sobra tempo para o resto." },
      { t: "Jantar às 17:00", ok: false, why: "O jantar é às 20:00." }] },
    { n: 5, q: "O autocarro passa às 7:30 e às 8:00. A aula é às 8:15. A viagem dura 20 minutos.", stage: "🚌", hint: "Qual autocarro você pega?", choices: [
      { t: "O das 7:30", ok: true, why: "7:30 + 20 min = 7:50. Chega antes das 8:15." },
      { t: "O das 8:00", ok: false, why: "8:00 + 20 min = 8:20. Chega atrasada." }] },
    { n: 5, q: "A live da {influ} é às 20:00. Seu TPC leva 1 hora.", stage: "📱📚", hint: "Até que horas começar o TPC?", choices: [
      { t: "Até às 19:00", ok: true, why: "19:00 + 1 hora = 20:00. Dá tempo da live." },
      { t: "Às 20:00", ok: false, why: "Às 20:00 você perde a live." },
      { t: "Às 19:45", ok: false, why: "19:45 + 1 hora = 20:45." }] },
    { n: 5, q: "Sábado: treino às 10:00, almoço na avó às 13:00.", stage: "🥋🍲", hint: "O treino dura 1h30. Dá tempo?", choices: [
      { t: "Sim, termina às 11:30", ok: true, why: "10:00 + 1h30 = 11:30. Antes das 13:00." },
      { t: "Não, termina às 14:00", ok: false, why: "1h30 depois das 10:00 é 11:30." }] },
    { n: 5, q: "Você combinou de encontrar a amiga às 16:00. São 15:50 e você vai se atrasar.", stage: "📱", hint: "O que fazer?", choices: [
      { t: "Mandar mensagem avisando", ok: true, why: "Avisar o atraso é respeito pelo tempo dela." },
      { t: "Não falar nada", ok: false, why: "Ela fica esperando sem saber." },
      { t: "Desistir sem avisar", ok: false, why: "Desistir sem avisar magoa." }] }
  ];

  // ---------------- Amigos ----------------
  C.social = [
    // nível 1
    { n: 1, q: "Alguém diz oi.", stage: "👋", hint: "O que você faz?", choices: [
      { t: "Olho e digo oi", ok: true, why: "Um oi curto abre a porta." },
      { t: "Ignoro e viro o rosto", ok: false, why: "Virar o rosto parece rejeição." },
      { t: "Grito o nome bem alto", ok: false, why: "Volume alto assusta. Voz normal basta." }] },
    { n: 1, q: "Você quer sentar com um grupo.", stage: "🪑", hint: "Como você entra?", choices: [
      { t: "Pergunto: posso sentar?", ok: true, why: "Pedir lugar mostra respeito." },
      { t: "Sento no meio sem falar", ok: false, why: "Sentar no meio, sem perguntar, afasta." },
      { t: "Fico olhando calada", ok: false, why: "Olhar fixo sem falar deixa os outros sem graça." }] },
    { n: 1, q: "Uma pessoa está falando.", stage: "🗣️", hint: "Ainda não é a sua vez.", choices: [
      { t: "Espero ela parar", ok: true, why: "Esperar a pausa é o sinal de 'agora posso falar'." },
      { t: "Corto e conto a minha história", ok: false, why: "Cortar parece que a história dela não importa." },
      { t: "Bato palmas para calar", ok: false, why: "Barulho no meio da fala afasta." }] },
    { n: 1, q: "Você perdeu o jogo.", stage: "🎮", hint: "A outra pessoa ganhou.", choices: [
      { t: "Digo: boa, você ganhou", ok: true, why: "Uma frase curta mantém o jogo possível amanhã." },
      { t: "Jogo o celular longe", ok: false, why: "Quebrar coisas acaba a brincadeira." },
      { t: "Digo que trapaceou", ok: false, why: "Acusar sem prova vira discussão." }] },
    { n: 1, q: "Você precisa de ajuda com a tarefa.", stage: "📚", hint: "Ninguém percebeu.", choices: [
      { t: "Peço: pode me ajudar?", ok: true, why: "Pedir em voz clara é o jeito mais rápido." },
      { t: "Fico parada esperando", ok: false, why: "As pessoas não adivinham. É preciso pedir." },
      { t: "Pego o caderno do colega", ok: false, why: "Pegar sem pedir parece falta de respeito." }] },
    { n: 1, q: "Alguém elogia o seu desenho.", stage: "🎨", hint: "O que você diz?", choices: [
      { t: "Digo: obrigada!", ok: true, why: "Obrigada é a resposta simples e boa." },
      { t: "Digo que está feio", ok: false, why: "Discordar do elogio deixa a pessoa sem graça." },
      { t: "Viro as costas", ok: false, why: "Sem resposta, parece que ignorou." }] },
    { n: 1, q: "Você esbarrou sem querer em uma pessoa.", stage: "💥", hint: "Ela fez cara de dor.", choices: [
      { t: "Desculpa, você está bem?", ok: true, why: "Pedir desculpa mostra que foi sem querer." },
      { t: "Digo que a culpa é dela", ok: false, why: "Acusar vira briga." },
      { t: "Saio andando", ok: false, why: "Ir embora parece que você não se importa." }] },
    { n: 1, q: "A professora explica. Você tem uma dúvida.", stage: "🙋", hint: "A sala está em silêncio.", choices: [
      { t: "Levanto a mão e pergunto", ok: true, why: "Mão levantada = 'quero perguntar'." },
      { t: "Grito a pergunta de longe", ok: false, why: "Gritar atrapalha a explicação." },
      { t: "Converso com o colega", ok: false, why: "Conversar atrapalha quem está ouvindo." }] },
    { n: 1, q: "Uma amiga conta um segredo bom para você.", stage: "🤫", hint: "Ela pediu para não contar à turma.", choices: [
      { t: "Não conto para a turma", ok: true, why: "Guardar faz a pessoa confiar em você. Se for algo perigoso, conte a um adulto." },
      { t: "Conto para a turma toda", ok: false, why: "Contar quebra a confiança." },
      { t: "Escrevo no grupo da turma", ok: false, why: "O que vai para o grupo todo mundo vê." }] },
    { n: 1, q: "Você está com muita raiva.", stage: "😠", hint: "O que ajuda?", choices: [
      { t: "Respiro fundo e me afasto", ok: true, why: "Respirar e dar espaço ajuda a raiva a baixar." },
      { t: "Bato na mesa", ok: false, why: "Bater assusta e não resolve." },
      { t: "Grito com quem está perto", ok: false, why: "Quem está perto não tem culpa." }] },
    { n: 1, q: "Um colega pede o seu lápis emprestado.", stage: "✏️", hint: "Você pode emprestar.", choices: [
      { t: "Empresto e peço de volta depois", ok: true, why: "Emprestar e combinar a volta mantém a amizade." },
      { t: "Pego de volta no meio", ok: false, why: "Tirar na hora atrapalha." },
      { t: "Digo sim e escondo", ok: false, why: "Dizer sim e não cumprir chateia." }] },
    { n: 1, q: "Você ganhou um presente que não gostou.", stage: "🎁", hint: "A pessoa está olhando.", choices: [
      { t: "Obrigada por lembrar de mim", ok: true, why: "Agradecer o carinho é o que importa." },
      { t: "Digo que é feio", ok: false, why: "Isso magoa quem escolheu com carinho." },
      { t: "Devolvo na hora", ok: false, why: "Devolver na hora é duro." }] },
    { n: 1, q: "No treino, você chega ao tatame.", stage: "🥋", hint: "Os colegas já estão lá.", choices: [
      { t: "Cumprimento todo mundo", ok: true, why: "Cumprimentar ao chegar é respeito no tatame e fora dele." },
      { t: "Entro sem olhar ninguém", ok: false, why: "Sem cumprimento, parece que você não liga." },
      { t: "Corro e pulo em alguém", ok: false, why: "Ninguém estava pronto. Pode machucar." }] },
    { n: 1, q: "A parceira de treino bateu (deu o tap).", stage: "🤚🥋", hint: "O que você faz?", choices: [
      { t: "Solto na hora", ok: true, why: "Bateu, soltou. É a regra mais importante." },
      { t: "Aperto mais um pouco", ok: false, why: "Apertar depois do tap machuca e quebra a confiança." },
      { t: "Finjo que não vi", ok: false, why: "O tap tem de ser respeitado sempre." }] },
    { n: 1, q: "O treino acabou.", stage: "🙇‍♀️", hint: "Você treinou com uma parceira.", choices: [
      { t: "Digo: obrigada pelo treino!", ok: true, why: "Agradecer a parceira é tradição e faz amizade." },
      { t: "Vou embora sem falar", ok: false, why: "Sair calada parece frieza." },
      { t: "Digo que ela é fraca", ok: false, why: "Isso magoa e ninguém mais quer treinar com você." }] },
    // nível 2: emoções e sinais
    { n: 2, q: "Ela cruza os braços e olha para baixo.", stage: "🙅‍♀️", hint: "Como ela pode estar?", choices: [
      { t: "Chateada ou desconfortável", ok: true, why: "Braços cruzados e olhar baixo costumam mostrar desconforto." },
      { t: "Muito feliz", ok: false, why: "Feliz costuma ter sorriso e olhar para cima." },
      { t: "Querendo um abraço seu agora", ok: false, why: "Não dá para saber. Melhor perguntar se está tudo bem." }] },
    { n: 2, q: "Você fala e ela olha o celular o tempo todo.", stage: "📱", hint: "O que isso pode querer dizer?", choices: [
      { t: "Agora ela não quer conversar", ok: true, why: "Olhar o celular sempre pode ser sinal de 'agora não'." },
      { t: "Ela está amando a conversa", ok: false, why: "Quem está gostando costuma olhar para você." },
      { t: "Tenho de falar mais alto", ok: false, why: "Falar mais alto não ajuda. Tente outra hora." }] },
    { n: 2, q: "😊", stage: "😊", hint: "Que emoção é essa?", choices: [
      { t: "Alegria", ok: true, why: "Sorriso e olhos fechadinhos = alegria." },
      { t: "Raiva", ok: false, why: "Raiva tem sobrancelhas para baixo." },
      { t: "Medo", ok: false, why: "Medo tem olhos bem abertos." }] },
    { n: 2, q: "😟", stage: "😟", hint: "Que emoção é essa?", choices: [
      { t: "Preocupação", ok: true, why: "Boca para baixo e testa franzida = preocupação." },
      { t: "Alegria", ok: false, why: "Alegria tem sorriso." },
      { t: "Sono", ok: false, why: "Sono tem olhos fechando e bocejo." }] },
    { n: 2, q: "🙄", stage: "🙄", hint: "Ela revirou os olhos. O que pode ser?", choices: [
      { t: "Impaciência ou tédio", ok: true, why: "Revirar os olhos costuma ser 'que chato'." },
      { t: "Amor", ok: false, why: "Amor não costuma ter olhos revirados." },
      { t: "Fome", ok: false, why: "Fome não aparece assim no rosto." }] },
    { n: 2, q: "A colega dá respostas curtas: 'aham', 'sei'.", stage: "💬", hint: "O que isso pode querer dizer?", choices: [
      { t: "Ela está ocupada ou sem vontade", ok: true, why: "Respostas curtas podem ser sinal para parar e tentar depois." },
      { t: "Ela quer que eu conte tudo de novo", ok: false, why: "Repetir pode cansar mais." },
      { t: "Ela está brava comigo para sempre", ok: false, why: "Pode ser só um dia ruim." }] },
    { n: 2, q: "A colega ri e olha para você enquanto você conta.", stage: "😄", hint: "O que isso mostra?", choices: [
      { t: "Ela está gostando", ok: true, why: "Rir junto e olhar para você = interesse." },
      { t: "Ela quer ir embora", ok: false, why: "Quem quer ir embora olha para os lados." },
      { t: "Ela está com medo", ok: false, why: "Medo não tem risada." }] },
    { n: 2, q: "Ela dá um passo para trás quando você chega perto.", stage: "😐", hint: "O corpo dela diz...", choices: [
      { t: "Preciso de mais espaço", ok: true, why: "Um braço de distância costuma ser confortável." },
      { t: "Chegue mais perto", ok: false, why: "Se a pessoa recua, quer espaço." },
      { t: "Me segure pelo braço", ok: false, why: "Tocar sem convite assusta." }] },
    { n: 2, q: "Todo mundo está rindo de uma piada que você não entendeu.", stage: "🤔", hint: "O que fazer?", choices: [
      { t: "Sorrio e pergunto depois a uma amiga", ok: true, why: "Não precisa entender tudo. Perguntar depois é normal." },
      { t: "Digo que a piada é idiota", ok: false, why: "Atacar a piada fecha o grupo." },
      { t: "Repito a piada 4 vezes", ok: false, why: "Repetir muito cansa." }] },
    { n: 2, q: "A colega boceja e olha o relógio.", stage: "🥱", hint: "Como ela está?", choices: [
      { t: "Cansada ou com pressa", ok: true, why: "Bocejo e relógio = cansaço ou pressa." },
      { t: "Muito animada", ok: false, why: "Animação tem olhos atentos e sorriso." }] },
    { n: 2, q: "O colega está sozinho no recreio, de cabeça baixa.", stage: "🧍", hint: "Como ele pode estar?", choices: [
      { t: "Triste ou sozinho", ok: true, why: "Cabeça baixa e sozinho pode ser tristeza." },
      { t: "Feliz e animado", ok: false, why: "Animado costuma estar de cabeça erguida." },
      { t: "Bravo com você", ok: false, why: "Não dá para saber. Ele nem olhou para você." }] },
    { n: 2, q: "Você contou da sua novela. A colega disse 'legal' e mudou de assunto.", stage: "📺", hint: "O que isso pode querer dizer?", choices: [
      { t: "Ela não conhece ou não curte", ok: true, why: "Tudo bem! Fale do assunto dela agora. A novela é ótima com quem também gosta." },
      { t: "Ela quer saber o episódio todo", ok: false, why: "Mudar de assunto mostra que ela quer outro tema." },
      { t: "Ela odeia você", ok: false, why: "Não. Só tem gostos diferentes." }] },
    // nível 3: escola nova
    { n: 3, q: "Primeiro dia na escola nova. Você não conhece ninguém.", stage: "🏫", hint: "O que ajuda?", choices: [
      { t: "Sorrir e dizer oi para quem senta perto", ok: true, why: "Um oi para quem está perto é o primeiro passo." },
      { t: "Ficar no celular o intervalo todo", ok: false, why: "No celular, ninguém se aproxima." },
      { t: "Contar a vida toda para a primeira pessoa", ok: false, why: "Muita informação de uma vez assusta. Vá devagar." }] },
    { n: 3, q: "Umas meninas conversam em roda. Você quer entrar.", stage: "👭👭", hint: "Como fazer?", choices: [
      { t: "Chego perto, ouço e comento algo do assunto", ok: true, why: "Ouvir primeiro e falar do mesmo assunto é o jeito mais fácil de entrar." },
      { t: "Começo a falar de outro assunto", ok: false, why: "Mudar de assunto interrompe o grupo." },
      { t: "Fico atrás delas sem falar", ok: false, why: "Ficar atrás sem falar parece estranho." }] },
    { n: 3, q: "Uma menina diz: 'Que coisa de criança!' sobre a sua mochila.", stage: "🎒", hint: "Você ficou triste.", choices: [
      { t: "Digo 'eu gosto dela' com calma e saio", ok: true, why: "Responder curto e calmo mostra força. Você pode gostar do que gosta." },
      { t: "Grito e xingo", ok: false, why: "Xingar vira briga e você pode se encrencar." },
      { t: "Choro na frente de todos e não conto a ninguém", ok: false, why: "Pode chorar, sim. Mas conte depois para a mãe ou o pai." }] },
    { n: 3, q: "O grupo não te chamou para o trabalho em dupla.", stage: "📋", hint: "Todo mundo já tem par.", choices: [
      { t: "Peço à professora para me ajudar a achar um par", ok: true, why: "A professora está lá para ajudar. Pedir é inteligente." },
      { t: "Faço sozinha sem avisar", ok: false, why: "A professora pode pensar que você não quis fazer em dupla." },
      { t: "Brigo com o grupo", ok: false, why: "Brigar afasta ainda mais." }] },
    { n: 3, q: "Riram de você no grupo do WhatsApp da turma.", stage: "💬😢", hint: "O que fazer?", choices: [
      { t: "Não respondo e mostro para os meus pais", ok: true, why: "Os pais podem ajudar. Responder com raiva piora." },
      { t: "Mando 30 mensagens com raiva", ok: false, why: "Mensagens com raiva ficam gravadas e pioram." },
      { t: "Apago tudo e guardo segredo", ok: false, why: "Segredo pesa. Contar aos pais é o melhor." }] },
    { n: 3, q: "Você ficou sozinha no intervalo.", stage: "🍎", hint: "O que pode fazer?", choices: [
      { t: "Procuro alguém sozinho também e digo oi", ok: true, why: "Quem está sozinho também gosta de companhia." },
      { t: "Penso que ninguém nunca vai gostar de mim", ok: false, why: "Não é verdade. Leva tempo fazer amigos numa escola nova." },
      { t: "Me escondo no banheiro todo dia", ok: false, why: "Se esconder te deixa mais sozinha. Conte aos pais como foi." }] },
    { n: 3, q: "Uma colega diz: 'Não pode sentar aqui'.", stage: "🚫🪑", hint: "Ficou chato.", choices: [
      { t: "Digo 'ok' e procuro outro lugar", ok: true, why: "Não insista. O problema não é você. Conte em casa como foi." },
      { t: "Sento à força", ok: false, why: "Sentar à força vira briga." },
      { t: "Empurro a cadeira dela", ok: false, why: "Empurrar machuca e pode dar castigo." }] },
    { n: 3, q: "Alguém te empurrou de propósito no corredor.", stage: "⚠️", hint: "Isso não está certo.", choices: [
      { t: "Conto à diretora de turma e aos pais", ok: true, why: "Agressão é sério. Os adultos precisam saber para ajudar." },
      { t: "Empurro de volta mais forte", ok: false, why: "Empurrar de volta pode te colocar em problema. Use o jiu-jitsu só no tatame." },
      { t: "Não conto para ninguém", ok: false, why: "Não guarde isso. Contar é coragem." }] },
    { n: 3, q: "A turma combina ir ao shopping. Ninguém te chamou.", stage: "🛍️", hint: "Você ficou triste.", choices: [
      { t: "Converso com os pais sobre como me sinto", ok: true, why: "Falar do que dói ajuda. Seus pais querem saber." },
      { t: "Vou atrás deles sem ser convidada", ok: false, why: "Ir sem convite pode ficar estranho." },
      { t: "Mando mensagem dizendo que eles são maus", ok: false, why: "Isso fecha portas para o futuro." }] },
    { n: 3, q: "Uma pessoa que você não conhece manda mensagem pedindo foto.", stage: "📵", hint: "Ela é simpática.", choices: [
      { t: "Não mando e mostro aos meus pais", ok: true, why: "Nunca mande fotos a desconhecidos. Mostre sempre aos pais." },
      { t: "Mando, ela é simpática", ok: false, why: "Simpatia online pode ser mentira. É perigoso." },
      { t: "Mando o meu endereço", ok: false, why: "Endereço é segredo de família." }] },
    { n: 3, q: "Você quer ser amiga da Duda. Ela gosta de dança.", stage: "💃", hint: "Como se aproximar?", choices: [
      { t: "Pergunto: que dança você gosta?", ok: true, why: "Perguntar sobre o que ela gosta mostra interesse verdadeiro." },
      { t: "Falo só do que eu gosto", ok: false, why: "Conversa é dos dois lados." },
      { t: "Sigo ela o dia todo", ok: false, why: "Seguir o tempo todo pode assustar. Vá aos poucos." }] },
    { n: 3, q: "Você fez uma amiga ontem. Hoje ela está com outras meninas.", stage: "👭", hint: "O que fazer?", choices: [
      { t: "Digo oi e espero ela me chamar", ok: true, why: "Amigas podem ter outras amigas. Um oi já mostra carinho." },
      { t: "Puxo ela para longe das outras", ok: false, why: "Puxar pode deixá-la sem graça." },
      { t: "Fico brava e não falo mais com ela", ok: false, why: "Ela não fez nada errado." }] },
    { n: 3, q: "Você não sabe onde é a sala da próxima aula.", stage: "🗺️", hint: "Está perdida.", choices: [
      { t: "Pergunto a uma funcionária ou colega", ok: true, why: "Perguntar é normal. Todo novato pergunta." },
      { t: "Fico parada no corredor", ok: false, why: "Parada, você chega atrasada." },
      { t: "Vou embora para casa", ok: false, why: "Sair da escola sem avisar é perigoso." }] },
    { n: 3, q: "Na {academia}, entrou uma aluna nova e tímida.", stage: "🥋", hint: "Você lembra como é ser nova.", choices: [
      { t: "Digo oi e ofereço para treinar juntas", ok: true, why: "Você pode ser a pessoa simpática que gostaria de encontrar." },
      { t: "Ignoro, não é problema meu", ok: false, why: "Um oi seu pode mudar o dia dela." },
      { t: "Mostro que eu sou mais forte", ok: false, why: "Mostrar força assusta. Gentileza faz amigas." }] },
    { n: 3, q: "Uma colega te chama de 'bebê' todo dia.", stage: "😣", hint: "Já aconteceu muitas vezes.", choices: [
      { t: "Peço para parar e conto aos pais e à escola", ok: true, why: "Quando se repete, é bullying. Adultos precisam ajudar." },
      { t: "Acho que mereço", ok: false, why: "Ninguém merece ser humilhado. Não é culpa sua." },
      { t: "Bato nela", ok: false, why: "Bater te coloca em problema. Conte aos adultos." }] },
    // nível 4: manter conversa
    { n: 4, q: "A colega diz: 'Fui ao cinema ontem'.", stage: "🎬", hint: "Como continuar a conversa?", choices: [
      { t: "Que filme você viu?", ok: true, why: "Perguntar de volta mostra interesse e a conversa continua." },
      { t: "Eu não gosto de cinema", ok: false, why: "Isso fecha a conversa." },
      { t: "Ok.", ok: false, why: "Uma palavra só deixa a conversa morrer." }] },
    { n: 4, q: "Vocês falaram 5 minutos da sua novela favorita.", stage: "⏱️", hint: "Ela só ouviu.", choices: [
      { t: "Paro e pergunto do que ela gosta", ok: true, why: "Conversa boa é como ping-pong: cada uma fala um pouco." },
      { t: "Conto o resto do episódio", ok: false, why: "Falar só de você cansa a outra pessoa." },
      { t: "Mostro 10 vídeos da novela", ok: false, why: "Um vídeo já basta. Depois devolva a vez." }] },
    { n: 4, q: "Meninas de 15 anos estão falando de música e séries.", stage: "🎧", hint: "Você quer participar.", choices: [
      { t: "Pergunto que música elas estão ouvindo", ok: true, why: "Entrar no assunto delas é melhor do que mudar para o seu." },
      { t: "Começo a cantar a música da novela infantil", ok: false, why: "Pode não combinar com a conversa agora. Guarde para quem também gosta." },
      { t: "Fico calada e saio", ok: false, why: "Uma pergunta curta já te coloca na conversa." }] },
    { n: 4, q: "A colega conta que a cachorra dela está doente.", stage: "🐕", hint: "O que dizer?", choices: [
      { t: "Que pena. Ela vai melhorar?", ok: true, why: "Mostrar carinho e perguntar é o certo." },
      { t: "Minha cachorra é mais bonita", ok: false, why: "Comparar agora parece que não liga." },
      { t: "Mudo para outro assunto", ok: false, why: "Mudar de assunto parece frieza." }] },
    { n: 4, q: "Você quer contar uma coisa engraçada no grupo.", stage: "😂", hint: "Alguém está contando outra história.", choices: [
      { t: "Espero ela acabar e conto curto", ok: true, why: "Esperar a vez e contar curto deixa todos rirem juntos." },
      { t: "Interrompo, a minha é melhor", ok: false, why: "Interromper chateia quem estava falando." },
      { t: "Conto bem alto por cima", ok: false, why: "Falar por cima atrapalha." }] },
    { n: 4, q: "No fim da conversa, você vai embora.", stage: "👋", hint: "Como se despedir?", choices: [
      { t: "Foi bom conversar! Até amanhã!", ok: true, why: "Uma despedida simpática deixa vontade de conversar de novo." },
      { t: "Saio sem falar nada", ok: false, why: "Sair sem falar parece que você ficou chateada." },
      { t: "Pergunto se amanhã ela fala comigo de novo 5 vezes", ok: false, why: "Perguntar demais pressiona. Uma vez basta." }] },
    { n: 4, q: "A colega pergunta: 'O que você fez no fim de semana?'", stage: "📅", hint: "Você foi ao treino.", choices: [
      { t: "Fui ao treino de jiu-jitsu. E você?", ok: true, why: "Responder e perguntar de volta = conversa boa." },
      { t: "Nada.", ok: false, why: "'Nada' encerra a conversa." },
      { t: "Conto todas as lutas em detalhe", ok: false, why: "Conte curto. Se ela quiser saber mais, ela pergunta." }] },
    { n: 4, q: "Uma colega diz que gosta de um cantor que você não conhece.", stage: "🎤", hint: "O que fazer?", choices: [
      { t: "Pergunto: qual música dele você indica?", ok: true, why: "Curiosidade faz a outra pessoa se sentir importante." },
      { t: "Digo que ele é ruim", ok: false, why: "Criticar sem conhecer afasta." },
      { t: "Finjo que conheço tudo", ok: false, why: "Não precisa fingir. Perguntar é melhor." }] },
    { n: 4, q: "Você mandou mensagem e a colega ainda não respondeu.", stage: "📱", hint: "Passaram 2 horas.", choices: [
      { t: "Espero, ela pode estar ocupada", ok: true, why: "As pessoas respondem quando podem." },
      { t: "Mando 15 mensagens seguidas", ok: false, why: "Muitas mensagens seguidas pressionam." },
      { t: "Acho que ela me odeia", ok: false, why: "Demorar não quer dizer odiar." }] },
    { n: 4, q: "No grupo da turma, estão falando da prova.", stage: "💬", hint: "Você quer participar.", choices: [
      { t: "Escrevo uma mensagem curta sobre a prova", ok: true, why: "Mensagem curta no assunto entra bem." },
      { t: "Mando um áudio de 5 minutos", ok: false, why: "Áudio longo é difícil de ouvir." },
      { t: "Mando 20 figurinhas seguidas", ok: false, why: "Muitas figurinhas seguidas cansam o grupo." }] },
    { n: 4, q: "Uma colega te elogia: 'Gostei do seu cabelo!'", stage: "💇‍♀️", hint: "Como responder e continuar?", choices: [
      { t: "Obrigada! O seu também está lindo.", ok: true, why: "Agradecer e devolver o carinho cria conexão." },
      { t: "Eu sei.", ok: false, why: "'Eu sei' pode soar convencida." },
      { t: "Fico calada", ok: false, why: "Sem resposta, ela fica sem graça." }] },
    { n: 4, q: "Na conversa, você percebe que falou alto demais.", stage: "🔊", hint: "As pessoas olharam.", choices: [
      { t: "Baixo a voz e continuo normal", ok: true, why: "Todo mundo às vezes fala alto. Baixar a voz resolve." },
      { t: "Falo ainda mais alto", ok: false, why: "Mais alto chama mais atenção." },
      { t: "Saio correndo", ok: false, why: "Não precisa fugir. É só ajustar a voz." }] }
  ];

  // ---------------- Companheira ----------------
  C.aberturas = [
    "{nome}, que bom te ver! Hoje você vai brilhar ✨",
    "Oi, {nome}! Eu estava com saudade de você 💛",
    "Você é corajosa, {nome}. Escola nova não é fácil, e você está indo!",
    "Cada dia você aprende mais. Eu tenho muito orgulho de você 🌟",
    "Faixa {faixa} hoje, {proxima} amanhã! Bora treinar a cabeça também 🥋",
    "{nome}, você tem {estrelas} estrelas! Isso é esforço de campeã 🏆",
    "Hoje é um ótimo dia para uma missão. Você consegue!",
    "Lembra: errar faz parte. Quem tenta sempre aprende 💪",
    "Que sorriso bonito você tem, {nome}! Vamos começar? 😊",
    "Você é uma pessoa gentil. O mundo precisa disso 💛",
    "Eu acredito em você, {nome}. Hoje e todos os dias.",
    "Uma missão por dia e você fica cada vez mais forte 🌱",
    "Bem-vinda de volta, campeã! 🥇",
    "{nome}, você é mais forte do que imagina 💪✨",
    "Hoje tem novidade na Novelinha? Vamos descobrir! 📺",
    "{dias} dias seguidos! Você não desiste, {nome} 🔥",
    "Seu cérebro está crescendo a cada missão 🧠🌟",
    "Você chegou! Agora o dia ficou melhor ☀️",
    "Respira fundo, sorri e vamos juntas 🌈",
    "Amigas de verdade chegam com o tempo. E eu já estou aqui 💛",
    "Você é única, {nome}. Do jeitinho que você é ✨",
    "Até a {influ} começou do zero. Passo a passo, você chega lá!",
    "Que tal ganhar uma figurinha nova hoje? 🎁",
    "Cada estrela é um passo. Você já deu muitos! ⭐",
    "{nome}, hoje você vai aprender algo legal. Prometo!",
    "Você é campeã no tatame e aqui também 🥋🏆",
    "Pensa numa coisa boa que aconteceu hoje. Viu? Tem coisas boas! 🌸",
    "Hoje é dia de ser gentil com você mesma 💛",
    "Vamos fazer da {academia} e da escola os seus lugares favoritos!",
    "Oi, oi! Pronta para mais uma aventura? 🚀"
  ];

  C.falasHome = {
    manha: [
      "Bom dia, {nome}! Tomou café? Uma missão rapidinha antes da escola? ☀️",
      "Manhã é hora de cérebro fresquinho. Bora? 🧠",
      "Hoje na escola, tenta dizer oi para uma pessoa nova. Você consegue! 👋"
    ],
    tarde: [
      "Como foi a escola, {nome}? Me conta no 'Como foi o dia' 💬",
      "Antes do vídeo da {influ}, que tal uma missão? 😉",
      "Hoje tem treino na {academia}? Bora aquecer o cérebro antes! 🥋",
      "Tarde boa para aprender uma palavra em inglês 💬"
    ],
    noite: [
      "Boa noite, {nome}! Uma missão curtinha e depois descansar 🌙",
      "Você foi incrível hoje. Amanhã tem mais 💛",
      "Antes de dormir, que tal um capítulo da Novelinha? 📺"
    ],
    geral: [
      "Faltam poucas estrelas para o próximo capítulo da Novelinha! 📺",
      "Sabia que dá para treinar conversa comigo? 💬",
      "Você já viu o seu álbum de figurinhas? 🎁",
      "Hoje é o dia de ganhar mais uma estrela ⭐"
    ]
  };

  C.fimMissao = [
    "Arrasou, {nome}! 🎉",
    "Mais uma missão! Você está ficando craque 🌟",
    "Que orgulho! Isso é esforço de verdade 💪",
    "Você não desistiu. Isso é o mais importante 💛",
    "Igual no jiu-jitsu: treino, treino, e um dia vem a faixa nova 🥋",
    "Missão cumprida! Bate aqui ✋",
    "Seu cérebro agradece! 🧠✨"
  ];

  C.humor = {
    rostos: [
      { e: "😄", t: "Muito bem", r: "Que dia bom! Fico tão feliz por você, {nome}! Conta para a sua mãe também 💛" },
      { e: "🙂", t: "Bem", r: "Que bom! Dias assim são ótimos. Amanhã pode ser ainda melhor 🌟" },
      { e: "😐", t: "Mais ou menos", r: "Tudo bem ter dias mais ou menos. Amanhã é um dia novo 🌱" },
      { e: "😢", t: "Triste", r: "Sinto muito que foi difícil. Você não está sozinha. Conta para a mãe ou o pai como foi? 💛" },
      { e: "😠", t: "Com raiva", r: "Raiva é normal. Respira fundo comigo: 1, 2, 3... Depois conta para os seus pais o que aconteceu 💛" }
    ],
    chips: [
      { t: "Fiquei sozinha", r: "Ficar sozinha dói. Isso não é culpa sua. Amanhã, tenta dizer oi para alguém que também esteja sozinho. E conta para os seus pais 💛" },
      { t: "Alguém foi legal comigo", r: "Que lindo! Amanhã você pode dizer 'oi' para essa pessoa de novo 😊" },
      { t: "Treino foi bom", r: "Boa, campeã! A faixa {proxima} está chegando 🥋" },
      { t: "Tive um problema", r: "Obrigada por me contar. Isso é importante: fala com a mãe ou o pai hoje, tá? Eles querem te ajudar 💛" },
      { t: "Aprendi algo novo", r: "Que demais! Cérebro crescendo 🧠✨" },
      { t: "Riram de mim", r: "Isso não está certo, e não é culpa sua. Conta hoje para os seus pais. Você é incrível do jeito que é 💛" },
      { t: "Fiz uma amiga", r: "Uau! Que notícia boa! 🎉 Amanhã pergunte algo sobre ela." }
    ],
    texto: "Obrigada por escrever, {nome}. Eu li tudo. Mostra isso para a sua mãe ou o seu pai também? Eles adoram saber de você 💛"
  };

  C.push = {
    manha: [
      "Bom dia, {nome}! Hoje vai ser um dia incrível ☀️",
      "Bom dia, campeã! Um sorriso e bora para a escola 😊",
      "Acorda, {nome}! A {lua} está torcendo por você hoje 💛",
      "Bom dia! Lembra: um oi pode começar uma amizade 👋",
      "Bom dia, {nome}! Você é corajosa. Hoje também ✨",
      "Bom dia! Café da manhã e coragem no bolso 🎒"
    ],
    dia: [
      "Como foi o seu dia, {nome}? Me conta 💬",
      "Oi, {nome}! Quero saber: como foi hoje? 🌈",
      "A {lua} quer saber como foi a escola 💛",
      "Hora do nosso papo: como você está? 😊"
    ],
    noite: [
      "Boa noite, {nome}! Você foi incrível hoje 🌙",
      "Boa noite! Amanhã é um dia novo cheio de coisas boas ✨",
      "Durma bem, campeã. Tenho orgulho de você 💛",
      "Boa noite, {nome}! Hora de descansar o cérebro 🌙",
      "Boa noite! Sonhe com a faixa {proxima} 🥋"
    ]
  };

  // ---------------- Faixas (jiu-jitsu) ----------------
  C.faixas = [
    "Branca", "Cinza e branca", "Cinza", "Cinza e preta",
    "Amarela e branca", "Amarela", "Amarela e preta",
    "Laranja e branca", "Laranja", "Laranja e preta",
    "Verde e branca", "Verde", "Verde e preta", "Azul", "Roxa"
  ];

  // ---------------- Figurinhas ----------------
  C.figurinhas = [
    { id: "b1", e: "🐱", t: "Gatinha", col: "Bichinhos" },
    { id: "b2", e: "🐶", t: "Cachorrinho", col: "Bichinhos" },
    { id: "b3", e: "🦄", t: "Unicórnio", col: "Bichinhos" },
    { id: "b4", e: "🐼", t: "Panda", col: "Bichinhos" },
    { id: "b5", e: "🦋", t: "Borboleta", col: "Bichinhos" },
    { id: "b6", e: "🐬", t: "Golfinho", col: "Bichinhos" },
    { id: "b7", e: "🦊", t: "Raposa", col: "Bichinhos" },
    { id: "b8", e: "🐰", t: "Coelhinho", col: "Bichinhos" },
    { id: "d1", e: "🍩", t: "Rosquinha", col: "Doces" },
    { id: "d2", e: "🧁", t: "Cupcake", col: "Doces" },
    { id: "d3", e: "🍓", t: "Morango", col: "Doces" },
    { id: "d4", e: "🍫", t: "Chocolate", col: "Doces" },
    { id: "d5", e: "🍦", t: "Sorvete", col: "Doces" },
    { id: "d6", e: "🍭", t: "Pirulito", col: "Doces" },
    { id: "d7", e: "🎂", t: "Bolo", col: "Doces" },
    { id: "d8", e: "🍬", t: "Bala", col: "Doces" },
    { id: "s1", e: "⭐", t: "Estrela", col: "Céu" },
    { id: "s2", e: "🌙", t: "Lua", col: "Céu" },
    { id: "s3", e: "🌈", t: "Arco-íris", col: "Céu" },
    { id: "s4", e: "☀️", t: "Sol", col: "Céu" },
    { id: "s5", e: "☁️", t: "Nuvem", col: "Céu" },
    { id: "s6", e: "🌠", t: "Estrela cadente", col: "Céu" },
    { id: "s7", e: "🪐", t: "Planeta", col: "Céu" },
    { id: "s8", e: "✨", t: "Brilho", col: "Céu" },
    { id: "f1", e: "🎤", t: "Microfone", col: "Fama" },
    { id: "f2", e: "📸", t: "Câmera", col: "Fama" },
    { id: "f3", e: "💄", t: "Batom", col: "Fama" },
    { id: "f4", e: "👑", t: "Coroa", col: "Fama" },
    { id: "f5", e: "🎬", t: "Claquete", col: "Fama" },
    { id: "f6", e: "💎", t: "Diamante", col: "Fama" },
    { id: "f7", e: "🎧", t: "Fone", col: "Fama" },
    { id: "f8", e: "🌟", t: "Estrela da TV", col: "Fama" },
    { id: "n1", e: "🌻", t: "Cap. 1: Primeiro dia", col: "Novelinha", especial: true },
    { id: "n2", e: "📋", t: "Cap. 2: O trabalho", col: "Novelinha", especial: true },
    { id: "n3", e: "🥋", t: "Cap. 3: No tatame", col: "Novelinha", especial: true },
    { id: "n4", e: "🎉", t: "Cap. 4: A festa", col: "Novelinha", especial: true },
    { id: "n5", e: "😔", t: "Cap. 5: Ninguém me chamou", col: "Novelinha", especial: true },
    { id: "n6", e: "👭", t: "Cap. 6: Outras amigas", col: "Novelinha", especial: true },
    { id: "n7", e: "📱", t: "Cap. 7: O grupo", col: "Novelinha", especial: true }
  ];

  // ---------------- Novelinha: Turma do Girassol ----------------
  C.novelinha = [
    {
      titulo: "Primeiro dia", emoji: "🌻", estrelas: 0, fig: "n1",
      cenas: [
        { emoji: "🏫😬", texto: "Bia é nova na Escola Girassol. O coração dela bate rápido." },
        { emoji: "🚪❓", texto: "Ela não sabe onde é a sala 10.", pergunta: { q: "O que a Bia deve fazer?", opcoes: [
          { t: "Perguntar a uma funcionária", ok: true, why: "Perguntar é normal. Todo novato pergunta." },
          { t: "Ficar parada no corredor", ok: false, why: "Parada, ela chega atrasada." },
          { t: "Voltar para casa", ok: false, why: "Sair da escola sem avisar é perigoso." }] } },
        { emoji: "👩‍🏫", texto: "A Professora Helena sorri: 'Bem-vinda, Bia! Senta ao lado da Duda.'" },
        { emoji: "👧🙂", texto: "Duda olha para a Bia e sorri.", pergunta: { q: "O que a Bia diz?", opcoes: [
          { t: "Oi! Eu sou a Bia.", ok: true, why: "Um oi com o nome é o começo perfeito." },
          { t: "Não fala nada", ok: false, why: "Sem resposta, a Duda pode pensar que a Bia não quer conversa." },
          { t: "Conta a vida toda de uma vez", ok: false, why: "Muita coisa de uma vez assusta. Vá devagar." }] } },
        { emoji: "🍎🥪", texto: "No intervalo, a cantina vende sumo a 1 euro e sandes a 2 euros.", pergunta: { conc: "num.dinheiro_somar", q: "Quanto a Bia paga pelos dois?", opcoes: [
          { t: "3 euros", ok: true, why: "1 + 2 = 3 euros." },
          { t: "2 euros", ok: false, why: "2 é só a sandes. Some o sumo: 3 euros." },
          { t: "12 euros", ok: false, why: "Não é 1 e 2 juntos. É 1 + 2 = 3." }] } },
        { emoji: "💁‍♀️😒", texto: "Lari passa e diz: 'Que lanche esquisito!'", pergunta: { q: "O que a Bia faz?", opcoes: [
          { t: "Diz 'eu gosto dele' e continua", ok: true, why: "Calma e firme. A Bia pode gostar do que gosta." },
          { t: "Grita com a Lari", ok: false, why: "Gritar vira briga." },
          { t: "Chora e não conta a ninguém", ok: false, why: "Pode ficar triste, sim. Mas é bom contar em casa." }] } },
        { emoji: "🌅📱", texto: "Em casa, Bia conta tudo para a mãe. A mãe abraça: 'Estou orgulhosa!' No próximo capítulo... um trabalho em grupo com a Lari! 😱" }
      ]
    },
    {
      titulo: "O trabalho em grupo", emoji: "📋", estrelas: 10, fig: "n2",
      cenas: [
        { emoji: "👩‍🏫📋", texto: "A professora diz: 'Trabalho em grupos de 3!'" },
        { emoji: "👭❓", texto: "Duda já tem par. Faltam pessoas no grupo da Lari e do Theo.", pergunta: { q: "Como a Bia entra no grupo?", opcoes: [
          { t: "Posso fazer com vocês?", ok: true, why: "Perguntar com educação é o melhor caminho." },
          { t: "Senta no grupo sem perguntar", ok: false, why: "Sem perguntar, parece invasão." },
          { t: "Faz sozinha sem avisar", ok: false, why: "A professora pediu grupo. Melhor perguntar." }] } },
        { emoji: "😂", texto: "Theo faz uma piada. Todos riem. Lari revira os olhos: 'Tanto faz.'" },
        { emoji: "🙄", texto: "A Lari revirou os olhos.", pergunta: { q: "Como a Lari parece estar?", opcoes: [
          { t: "Impaciente ou entediada", ok: true, why: "Revirar os olhos costuma querer dizer 'que chato'." },
          { t: "Muito feliz", ok: false, why: "Feliz teria sorriso." },
          { t: "Com fome", ok: false, why: "Fome não aparece assim." }] } },
        { emoji: "🖍️📄", texto: "O cartaz precisa de 4 fotos por página. São 3 páginas.", pergunta: { conc: "num.multiplicar", q: "Quantas fotos no total?", opcoes: [
          { t: "12 fotos", ok: true, why: "3 páginas com 4 = 4 + 4 + 4 = 12." },
          { t: "7 fotos", ok: false, why: "7 seria 4 + 3. São 3 grupos de 4: 12." },
          { t: "9 fotos", ok: false, why: "Conte 4 + 4 + 4 = 12." }] } },
        { emoji: "💡", texto: "Bia tem uma ideia para o título. A Lari está falando.", pergunta: { q: "Quando a Bia fala?", opcoes: [
          { t: "Espera a Lari acabar", ok: true, why: "Esperar a vez faz todos ouvirem a ideia." },
          { t: "Interrompe bem alto", ok: false, why: "Interromper deixa a Lari chateada." },
          { t: "Desiste da ideia", ok: false, why: "A ideia é boa! É só esperar a vez." }] } },
        { emoji: "🏆", texto: "A professora adora o título da Bia! Lari diz baixinho: 'Ficou bom.' No próximo capítulo... campeonato de jiu-jitsu na escola! 🥋" }
      ]
    },
    {
      titulo: "Bia no tatame", emoji: "🥋", estrelas: 25, fig: "n3",
      cenas: [
        { emoji: "📢🥋", texto: "A escola faz um dia do desporto. Bia vai mostrar jiu-jitsu!" },
        { emoji: "🤼‍♀️", texto: "Antes da luta, Bia encontra a adversária, a Marta.", pergunta: { q: "O que a Bia faz?", opcoes: [
          { t: "Cumprimenta a Marta", ok: true, why: "No jiu-jitsu, respeito vem primeiro." },
          { t: "Faz cara de má", ok: false, why: "Cara de má não é respeito." },
          { t: "Diz que vai ganhar fácil", ok: false, why: "Gabar-se antes é falta de respeito." }] } },
        { emoji: "🔢", texto: "Bia faz uma raspagem (2 pontos) e uma passagem (3 pontos).", pergunta: { conc: "num.somar", q: "Quantos pontos ela tem?", opcoes: [
          { t: "5 pontos", ok: true, why: "2 + 3 = 5 pontos." },
          { t: "6 pontos", ok: false, why: "Conte de novo: 2 + 3 = 5." },
          { t: "23 pontos", ok: false, why: "Não é juntar os números. É somar: 5." }] } },
        { emoji: "🤚", texto: "A Marta bate no tatame: tap!", pergunta: { q: "O que a Bia faz?", opcoes: [
          { t: "Solta na hora", ok: true, why: "Bateu, soltou. Sempre." },
          { t: "Aperta mais", ok: false, why: "Depois do tap, apertar machuca." },
          { t: "Finge que não viu", ok: false, why: "O tap tem de ser respeitado." }] } },
        { emoji: "🥈", texto: "Na final, Bia perde por 2 pontos. Ela fica triste.", pergunta: { q: "O que a Bia diz à vencedora?", opcoes: [
          { t: "Parabéns, boa luta!", ok: true, why: "Perder com respeito também é ser campeã." },
          { t: "Você roubou!", ok: false, why: "Acusar sem prova é feio." },
          { t: "Não diz nada e vai embora", ok: false, why: "Cumprimentar no fim é a regra do tatame." }] } },
        { emoji: "👏👭", texto: "Duda corre e abraça a Bia: 'Você foi demais!' Até a Lari bate palmas." },
        { emoji: "💌", texto: "No fim do dia, a Duda entrega um envelope colorido... No próximo capítulo... a festa da Duda! 🎉" }
      ]
    },
    {
      titulo: "A festa da Duda", emoji: "🎉", estrelas: 45, fig: "n4",
      cenas: [
        { emoji: "💌", texto: "É um convite! A festa da Duda é sábado às 16:00." },
        { emoji: "🏠👩", texto: "Bia quer muito ir.", pergunta: { q: "O que a Bia faz primeiro?", opcoes: [
          { t: "Pede autorização aos pais", ok: true, why: "Os pais precisam saber onde ela vai estar." },
          { t: "Vai sem avisar", ok: false, why: "Sair sem avisar é perigoso e preocupa os pais." },
          { t: "Recusa, com vergonha", ok: false, why: "Ela quer ir! É só conversar com os pais." }] } },
        { emoji: "🕓", texto: "A festa começa às 16:00. A viagem de carro leva 30 minutos.", pergunta: { conc: "tempo.diferenca_minutos", q: "A que horas a Bia sai de casa?", opcoes: [
          { t: "15:30", ok: true, why: "16:00 menos 30 minutos = 15:30." },
          { t: "16:00", ok: false, why: "Saindo às 16:00, chega atrasada." },
          { t: "16:30", ok: false, why: "16:30 é depois da festa começar." }] } },
        { emoji: "🎈🎶", texto: "Na festa, umas meninas falam de uma série nova." },
        { emoji: "💬", texto: "A Bia não conhece a série.", pergunta: { q: "O que a Bia diz?", opcoes: [
          { t: "Do que é a série?", ok: true, why: "Perguntar mostra interesse e entra na conversa." },
          { t: "Muda para a novela dela", ok: false, why: "Melhor ouvir o assunto delas primeiro." },
          { t: "Diz que a série é chata", ok: false, why: "Criticar sem conhecer afasta." }] } },
        { emoji: "🎂", texto: "Hora do bolo! Todos cantam parabéns para a Duda." },
        { emoji: "👋🌙", texto: "É hora de ir embora.", pergunta: { q: "Como a Bia se despede?", opcoes: [
          { t: "Obrigada pelo convite, Duda!", ok: true, why: "Agradecer deixa a Duda feliz." },
          { t: "Sai sem falar", ok: false, why: "Sair sem falar parece que não gostou." },
          { t: "Pede para ficar até meia-noite", ok: false, why: "Os pais combinaram a hora. Respeitar é importante." }] } },
        { emoji: "🚗💛", texto: "No carro, a Bia conta tudo para o pai. 'Hoje eu fiz uma amiga de verdade.' No próximo capítulo... ninguém chamou a Bia no recreio! 😔" }
      ]
    },
    {
      titulo: "Ninguém me chamou", emoji: "😔", estrelas: 70, fig: "n5",
      cenas: [
        { emoji: "🏫☀️", texto: "É segunda-feira. A Bia chega à escola animada." },
        { emoji: "👭🏃", texto: "No recreio, a Duda e a Lari combinam jogar à apanhada. Ninguém chamou a Bia.", pergunta: { conc: "social.amizade", q: "O que a Bia faz?", opcoes: [
          { t: "Pergunta: posso jogar com vocês?", ok: true, why: "Elas não leem pensamentos. Talvez só não pensaram nisso. Perguntar resolve." },
          { t: "Vai embora e fica chateada sem dizer nada", ok: false, why: "Elas não sabem que a Bia queria jogar. Dizer ajuda." },
          { t: "Diz: ninguém gosta de mim!", ok: false, why: "Isso dói e afasta. Melhor pedir o que quer." }] } },
        { emoji: "😕", texto: "A Lari responde: 'Agora não, o jogo já começou.'", pergunta: { conc: "social.amizade", q: "O que a Bia pensa e faz?", opcoes: [
          { t: "Fica um pouco triste, tudo bem, e tenta outro dia", ok: true, why: "'Agora não' não quer dizer 'nunca'. A Bia pode sentir tristeza e tentar outra vez." },
          { t: "Decide que elas odeiam a Bia", ok: false, why: "'Agora não' é sobre o jogo, não sobre a Bia." },
          { t: "Estraga o jogo de propósito", ok: false, why: "Estragar o jogo deixa todos chateados." }] } },
        { emoji: "📖🧒", texto: "O Theo está sozinho, a ler um livro.", pergunta: { conc: "social.amizade", q: "O que a Bia pode fazer?", opcoes: [
          { t: "Sentar perto e perguntar o que ele lê", ok: true, why: "Uma pergunta simples começa uma conversa." },
          { t: "Fingir que não o vê", ok: false, why: "Ele também está sozinho. Um oi ajuda os dois." },
          { t: "Ficar sozinha a olhar o relógio", ok: false, why: "Assim o recreio fica longo e triste." }] } },
        { emoji: "🕑", texto: "O recreio dura 20 minutos. Já passaram 5.", pergunta: { conc: "tempo.diferenca_minutos", q: "Quanto tempo falta?", opcoes: [
          { t: "15 minutos", ok: true, why: "20 − 5 = 15 minutos." },
          { t: "25 minutos", ok: false, why: "Já passaram 5, então falta menos: 20 − 5 = 15." },
          { t: "5 minutos", ok: false, why: "5 é o que já passou. Faltam 15." }] } },
        { emoji: "🏠😞", texto: "Em casa, a Bia ainda está chateada.", pergunta: { conc: "social.digital", q: "O que ajuda mais?", opcoes: [
          { t: "Contar à mãe como foi o recreio", ok: true, why: "Contar alivia, e a mãe pode ajudar a pensar." },
          { t: "Guardar tudo e não falar com ninguém", ok: false, why: "Guardar tudo pesa. Contar a alguém de confiança ajuda." },
          { t: "Mandar mensagens com raiva para a Lari", ok: false, why: "Mensagens com raiva magoam e é difícil apagar depois." }] } },
        { emoji: "🌅📖", texto: "A mãe ouve e dá um abraço. No dia seguinte, o Theo chama a Bia para ler juntos. No próximo capítulo... a Duda está sempre com outras meninas! 👭" }
      ]
    },
    {
      titulo: "Outras amigas", emoji: "👭", estrelas: 100, fig: "n6",
      cenas: [
        { emoji: "🎈🎶", texto: "É o dia da festa da turma. A Duda está sempre com outras meninas." },
        { emoji: "💭", texto: "A Bia sente um aperto no peito.", pergunta: { conc: "social.amizade", q: "O que a Bia pensa?", opcoes: [
          { t: "A Duda pode ter mais de uma amiga. Isso não muda a nossa amizade", ok: true, why: "Ter outras amigas não quer dizer que gosta menos da Bia." },
          { t: "A Duda não gosta mais de mim", ok: false, why: "Não há prova disso. Ela só está com mais gente." },
          { t: "Preciso afastar as outras meninas", ok: false, why: "Afastar os outros estraga amizades." }] } },
        { emoji: "👋", texto: "A Duda olha para a Bia e acena para ela se juntar.", pergunta: { conc: "social.sinais_corpo", q: "O que o aceno quer dizer?", opcoes: [
          { t: "Vem cá, juntar-te a nós", ok: true, why: "Acenar para alguém vir é um convite." },
          { t: "Vai embora", ok: false, why: "Para mandar embora, o gesto seria outro." },
          { t: "Está com raiva", ok: false, why: "Quem está com raiva não acena a sorrir." }] } },
        { emoji: "🎤", texto: "As meninas falam do cantor favorito delas. A Bia gosta de outro.", pergunta: { conc: "social.amizade", q: "O que a Bia faz?", opcoes: [
          { t: "Diz de quem ela gosta, sem criticar o cantor delas", ok: true, why: "Ser verdadeira e simpática: as amigas conhecem a Bia de verdade." },
          { t: "Diz que o cantor delas é horrível", ok: false, why: "Criticar o que as outras gostam afasta." },
          { t: "Finge gostar do mesmo", ok: false, why: "Fingir cansa. As amigas não conhecem a Bia de verdade." }] } },
        { emoji: "🎈", texto: "Cada menina pega 3 balões. São 4 meninas.", pergunta: { conc: "num.multiplicar", q: "Quantos balões ao todo?", opcoes: [
          { t: "12 balões", ok: true, why: "4 meninas com 3: 3 + 3 + 3 + 3 = 12." },
          { t: "7 balões", ok: false, why: "7 seria 4 + 3. São 4 grupos de 3: 12." },
          { t: "9 balões", ok: false, why: "Conte 3 + 3 + 3 + 3 = 12." }] } },
        { emoji: "🏡", texto: "A Duda diz: 'Hoje vou à casa da Marta.' A Bia queria ir também.", pergunta: { conc: "social.amizade", q: "O que a Bia diz?", opcoes: [
          { t: "Fiquei um pouco triste. Podemos combinar outro dia?", ok: true, why: "Dizer o que sente, com calma, ajuda a amiga a entender." },
          { t: "Tudo bem. E nunca mais falo contigo", ok: false, why: "Cortar a amizade por isso é demais." },
          { t: "Se fores, nunca mais falo contigo", ok: false, why: "Ameaçar assusta e afasta." }] } },
        { emoji: "📅💛", texto: "A Duda sorri: 'Sábado é nosso!' No próximo capítulo... o grupo de WhatsApp da turma! 📱" }
      ]
    },
    {
      titulo: "O grupo", emoji: "📱", estrelas: 130, fig: "n7",
      cenas: [
        { emoji: "📱🌻", texto: "A turma criou um grupo no WhatsApp. A Bia entrou." },
        { emoji: "💬💬", texto: "Chegam 30 mensagens sobre um filme que a Bia não viu.", pergunta: { conc: "social.digital", q: "O que a Bia faz?", opcoes: [
          { t: "Lê com calma e pergunta: de que filme falam?", ok: true, why: "Perguntar numa mensagem só é simples e simpático." },
          { t: "Manda 30 mensagens seguidas", ok: false, why: "Muitas mensagens seguidas incomodam todo mundo." },
          { t: "Sai do grupo sem dizer nada", ok: false, why: "Sair assim afasta. Melhor perguntar." }] } },
        { emoji: "📸😬", texto: "Alguém partilha uma foto engraçada de uma menina da turma, sem ela saber.", pergunta: { conc: "social.digital", q: "O que a Bia faz?", opcoes: [
          { t: "Não partilha e conta a um adulto", ok: true, why: "Fotos de outras pessoas, sem licença, podem magoar. Um adulto ajuda a resolver." },
          { t: "Partilha também, para ser aceite", ok: false, why: "Partilhar magoa a menina e pode trazer problemas." },
          { t: "Ri e pede mais fotos", ok: false, why: "Rir assim também magoa quem está na foto." }] } },
        { emoji: "👤❓", texto: "Um rapaz que a Bia não conhece entra no chat e pede o número e a morada dela.", pergunta: { conc: "social.seguranca", q: "O que a Bia faz?", opcoes: [
          { t: "Não dá nada e conta aos pais", ok: true, why: "Número e morada são só para quem os pais conhecem. Contar aos pais protege." },
          { t: "Dá o número porque ele parece simpático", ok: false, why: "Parecer simpático no chat não quer dizer que é seguro." },
          { t: "Dá só a morada", ok: false, why: "A morada é ainda mais perigosa. Não se dá a desconhecidos." }] } },
        { emoji: "🌳🕒", texto: "O grupo combina: 'Encontro no parque às 15:30.' Agora são 15:00.", pergunta: { conc: "tempo.diferenca_minutos", q: "Quanto tempo falta?", opcoes: [
          { t: "30 minutos", ok: true, why: "De 15:00 a 15:30 são 30 minutos." },
          { t: "60 minutos", ok: false, why: "60 minutos é uma hora inteira. Aqui é só meia hora: 30." },
          { t: "15 minutos", ok: false, why: "De 15:00 a 15:30 contam-se 30 minutos." }] } },
        { emoji: "😠📱", texto: "A Lari manda uma mensagem que deixa a Bia com raiva.", pergunta: { conc: "social.digital", q: "Antes de responder, o que ajuda?", opcoes: [
          { t: "Respirar, esperar um pouco e responder com calma", ok: true, why: "Com calma, a Bia diz o que sente sem magoar." },
          { t: "Responder logo, tudo em maiúsculas", ok: false, why: "Maiúsculas parecem gritos e pioram a briga." },
          { t: "Mandar 30 mensagens com raiva", ok: false, why: "Mensagens com raiva são difíceis de apagar e magoam." }] } },
        { emoji: "👩‍👧💛", texto: "Bia mostra o grupo à mãe. 'Bem-vinda à turma, Bia!' Novos capítulos em breve! 🌻" }
      ]
    }
  ];

  // ---------------- Música: cantores, músicas e curiosidades ----------------
  // Só factos conferidos. f.certa + f.erradas (2) formam as 3 opções.
  C.musica = [
    { id: "ariana", nome: "Ariana Grande", e: "💜",
      musicas: ["thank u, next", "7 rings", "positions", "Side to Side", "Into You", "Break Free", "yes, and?", "we can't be friends"],
      fatos: [
        { q: "Que personagem a Ariana Grande fazia na série Victorious?", certa: "Cat Valentine", erradas: ["Maya Hart", "Alex Russo"], why: "Ela era a Cat Valentine, a amiga de cabelo ruivo." },
        { q: "No filme Wicked, que personagem a Ariana faz?", certa: "Glinda", erradas: ["Elphaba", "Dorothy"], why: "Ela é a Glinda. A Elphaba é a Cynthia Erivo." },
        { q: "Qual penteado é a marca registrada da Ariana?", certa: "Rabo de cavalo alto", erradas: ["Franja curta", "Cabelo bem curto"], why: "O rabo de cavalo alto é a marca dela." }
      ] },
    { id: "taylor", nome: "Taylor Swift", e: "🦋",
      musicas: ["Shake It Off", "Love Story", "Blank Space", "Anti-Hero", "Cruel Summer", "You Belong with Me"],
      fatos: [
        { q: "Como são chamados os fãs da Taylor Swift?", certa: "Swifties", erradas: ["Arianators", "Beliebers"], why: "Os fãs da Taylor são os Swifties." },
        { q: "Como se chama a turnê mais famosa da Taylor?", certa: "The Eras Tour", erradas: ["Sweetener Tour", "Short n' Sweet Tour"], why: "É a The Eras Tour, com músicas de todas as fases dela." },
        { q: "Qual é o número da sorte da Taylor Swift?", certa: "13", erradas: ["7", "21"], why: "O número da sorte dela é o 13." }
      ] },
    { id: "billie", nome: "Billie Eilish", e: "💚",
      musicas: ["bad guy", "Ocean Eyes", "Happier Than Ever", "BIRDS OF A FEATHER", "What Was I Made For?"],
      fatos: [
        { q: "Quem escreve as músicas junto com a Billie Eilish?", certa: "O irmão, Finneas", erradas: ["O pai", "Um primo"], why: "O irmão dela, o Finneas, faz as músicas com ela." },
        { q: "“What Was I Made For?” é de qual filme?", certa: "Barbie", erradas: ["Wicked", "Frozen"], why: "Ela cantou essa música no filme Barbie." }
      ] },
    { id: "olivia", nome: "Olivia Rodrigo", e: "💜",
      musicas: ["drivers license", "good 4 u", "vampire", "deja vu", "traitor"],
      fatos: [
        { q: "Quais são os dois álbuns da Olivia Rodrigo?", certa: "SOUR e GUTS", erradas: ["1989 e Midnights", "Positions e Sweetener"], why: "Os álbuns dela são SOUR e GUTS." },
        { q: "Em qual série ela atuou antes de ficar famosa na música?", certa: "High School Musical: A Série", erradas: ["Victorious", "Garota Conhece o Mundo"], why: "Ela fez a Nini em High School Musical: A Série." }
      ] },
    { id: "sabrina", nome: "Sabrina Carpenter", e: "☕",
      musicas: ["Espresso", "Please Please Please", "Nonsense", "Feather", "Taste"],
      fatos: [
        { q: "“Espresso” está em qual álbum da Sabrina Carpenter?", certa: "Short n' Sweet", erradas: ["SOUR", "Midnights"], why: "Espresso está no álbum Short n' Sweet." },
        { q: "Em qual série da Disney a Sabrina fez a Maya?", certa: "Garota Conhece o Mundo", erradas: ["Os Feiticeiros de Waverly Place", "Victorious"], why: "Ela era a Maya em Garota Conhece o Mundo." }
      ] },
    { id: "dua", nome: "Dua Lipa", e: "🪩",
      musicas: ["Levitating", "New Rules", "Don't Start Now", "Dance the Night", "Houdini"],
      fatos: [
        { q: "Em que cidade a Dua Lipa nasceu?", certa: "Londres", erradas: ["Nova York", "Paris"], why: "Ela nasceu em Londres." },
        { q: "“Dance the Night” faz parte de qual filme?", certa: "Barbie", erradas: ["Wicked", "Moana"], why: "É uma música do filme Barbie." }
      ] },
    { id: "selena", nome: "Selena Gomez", e: "🌟",
      musicas: ["Lose You to Love Me", "Calm Down", "Come & Get It", "Love You Like a Love Song", "Who Says"],
      fatos: [
        { q: "Que personagem a Selena Gomez fazia em Os Feiticeiros de Waverly Place?", certa: "Alex Russo", erradas: ["Cat Valentine", "Maya Hart"], why: "Ela era a Alex Russo." },
        { q: "Com qual cantor a Selena fez “Calm Down”?", certa: "Rema", erradas: ["Khalid", "Finneas"], why: "Calm Down é a parceria da Selena com o Rema." }
      ] },
    { id: "anitta", nome: "Anitta", e: "🇧🇷",
      musicas: ["Envolver", "Girl from Rio", "Medicina", "Vai Malandra"],
      fatos: [
        { q: "De que cidade é a Anitta?", certa: "Rio de Janeiro", erradas: ["São Paulo", "Lisboa"], why: "Ela é do Rio de Janeiro." },
        { q: "De que país é a Anitta?", certa: "Brasil", erradas: ["Portugal", "Estados Unidos"], why: "Ela é brasileira." }
      ] },
    { id: "katseye", nome: "KATSEYE", e: "👁️", apelidos: ["kateseye", "katseye", "kats eye", "katseyes"],
      musicas: ["Touch", "Gnarly", "Gabriela", "Debut"],
      fatos: [
        { q: "Quantas integrantes tem o KATSEYE?", certa: "6", erradas: ["4", "8"], why: "São seis: Sophia, Manon, Daniela, Lara, Megan e Yoonchae." },
        { q: "Qual programa formou o grupo KATSEYE?", certa: "Dream Academy", erradas: ["The Voice", "Ídolos"], why: "O grupo nasceu no Dream Academy." },
        { q: "O KATSEYE foi criado por quais empresas?", certa: "HYBE e Geffen Records", erradas: ["Disney e Netflix", "Spotify e YouTube"], why: "O grupo é da HYBE junto com a Geffen Records." },
        { q: "Como se chama o primeiro EP do KATSEYE?", certa: "SIS (Soft Is Strong)", erradas: ["Beautiful Chaos", "Dream Academy"], why: "O primeiro EP é SIS (Soft Is Strong). Beautiful Chaos veio depois." }
      ] },
    { id: "barbara", nome: "Bárbara Tinoco", e: "🎸", apelidos: ["barbara tinoco", "bárbara tinoco", "barbara"],
      musicas: ["Antes Dela Dizer Que Sim", "Sei Lá", "Outras Línguas", "Na Minha Escola"],
      fatos: [
        { q: "De que país é a Bárbara Tinoco?", certa: "Portugal", erradas: ["Brasil", "Estados Unidos"], why: "Ela é portuguesa." },
        { q: "Em qual programa de TV a Bárbara apareceu em 2018?", certa: "The Voice Portugal", erradas: ["Dança com as Estrelas", "Big Brother"], why: "Ela ficou conhecida no The Voice Portugal." },
        { q: "Qual é o primeiro álbum da Bárbara Tinoco?", certa: "Bárbara", erradas: ["Hormonal", "Sei Lá"], why: "O primeiro álbum se chama Bárbara." },
        { q: "Ela foi a primeira artista portuguesa a ter um concerto em qual plataforma?", certa: "Disney+", erradas: ["Netflix", "YouTube"], why: "Foi a primeira com concerto no Disney+." }
      ] }
  ];

  // ---------------- Treino de conversa (chat) ----------------
  C.cenarios = [
    { id: "intervalo", t: "No intervalo", e: "🍎", papel: "uma colega de turma de 15 anos, simpática mas um pouco tímida, sentada no intervalo comendo um lanche" },
    { id: "sala", t: "Chegando na sala", e: "🏫", papel: "uma colega de turma que senta ao lado, no começo da aula" },
    { id: "treino", t: "Fim do treino", e: "🥋", papel: "uma parceira de treino de jiu-jitsu, da mesma idade, no fim da aula" },
    { id: "whats", t: "Grupo do WhatsApp", e: "💬", papel: "uma colega no grupo de WhatsApp da turma, conversando sobre a prova de amanhã" },
    { id: "festa", t: "Numa festa", e: "🎉", papel: "uma menina de 15 anos que ela acabou de conhecer numa festa de aniversário" }
  ];

  if (typeof module !== "undefined" && module.exports) module.exports = C;
  else root.CONTEUDO = C;
})(typeof self !== "undefined" ? self : this);
