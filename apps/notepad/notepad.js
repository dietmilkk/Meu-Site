(function () {
  "use strict";

  var win = document.getElementById("notepadWindow");
  var dragHandle = document.getElementById("notepadDragHandle");
  var btnClose = document.getElementById("notepadBtnClose");
  var btnMinimize = document.getElementById("notepadBtnMinimize");
  var btnMaximize = document.getElementById("notepadBtnMaximize");
  var textarea = document.getElementById("notepadTextarea");
  var status = document.getElementById("notepadStatus");

  var NOTEPAD_TEXT =
    "# I. A PREMISSA\n" +
    "\n" +
    "Somos todos iguais. Ossos, carne, cérebro. Livres por natureza — mas condicionados pelas complexidades da nossa capacidade de previsão, forjada nos dados que processamos ao longo da vida.\n" +
    "\n" +
    "Não nascemos prontos. Nascemos abertos. Porém, desde cedo, aprendemos a antecipar o mundo: o que é seguro, o que é perigoso, o que dá recompensa, o que traz castigo, o que rende amor, o que rende exclusão.\n" +
    "\n" +
    "Essa capacidade de prever nos protege. Mas também nos prende. Quando o cérebro repete padrões antigos como verdades eternas, a liberdade se reduz a um roteiro invisível. Muitas vezes não escolhemos: apenas repetimos o que aprendemos a esperar.\n" +
    "\n" +
    "Aí está a forma mais profunda de escravidão: **parecer livre enquanto se obedece a condicionamentos que nem percebemos.**\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## II. O DIAGNÓSTICO: A VIDA COMO MERCADORIA\n" +
    "\n" +
    "A vida humana não pode ser reduzida a mercadoria. No entanto, o mundo contemporâneo tenta fazer exatamente isso. Transforma presença em audiência, corpo em produto, tempo em lucro, fé em espetáculo, desejo em consumo, dor em fracasso. A pessoa deixa de ser fim em si mesma e passa a valer pelo que produz, aparenta, compra, entrega, rende.\n" +
    "\n" +
    "Há uma violência silenciosa nesse processo. Ela não aparece apenas como opressão externa. Instala-se dentro. A pessoa se cobra como empresa. Se descansa, sente culpa. Se erra, sente vergonha. Se envelhece, sente medo. Se não performa, sente que perdeu valor. O sistema não precisa apenas explorar o corpo: explora a mente. Ensina cada indivíduo a se vigiar, se corrigir e se punir.\n" +
    "\n" +
    "O corpo sente. O corpo cansa. O corpo muda. O corpo precisa de tempo, vínculo, sentido e descanso. Nada disso é defeito. **Defeito é uma organização social que transforma necessidades humanas em fraquezas para vender soluções.**\n" +
    "\n" +
    "Unhas gastas, pés sujos, mãos ásperas, rostos sem cirurgias, lágrimas sem disfarce, dúvidas sinceras, cansaços reais — tudo isso pertence à existência. A dignidade não depende de aparência lucrativa.\n" +
    "\n" +
    "A felicidade também foi sequestrada. Transformaram-na em promessa permanente: compre, alcance, conquiste, apareça, melhore, corrija, acumule. Mas a felicidade vendida assim não pacifica — inquieta. Cria a sensação de que sempre falta algo. E enquanto falta, o presente é sacrificado.\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## III. O TEMPO ROUBADO\n" +
    "\n" +
    "O dinheiro não é mau em si. É instrumento. O problema surge quando se torna medida absoluta — quando define quem merece respeito, descanso, cuidado, futuro. Para quem vive com abundância, dinheiro é número. Para quem vive com escassez, dinheiro é tempo. E tempo é vida.\n" +
    "\n" +
    "Se alguém precisa vender todas as suas horas para sobreviver, não está apenas trabalhando: está entregando pedaços da própria existência.\n" +
    "\n" +
    "**Roubar tempo é roubar vida.** E depois o sistema devolve em forma de produto aquilo que tomou: vende descanso caro, lazer caro, paz cara, natureza cara, silêncio caro, saúde cara, liberdade cara. Se você não protege seu tempo, alguém o transforma em lucro e cobra para que você tenha acesso.\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## IV. OS ÍDOLOS E A FÉ ARMADA\n" +
    "\n" +
    "Existe uma idolatria moderna, mais sutil do que parece. O ídolo contemporâneo nem sempre é imagem religiosa. Pode ser fama, dinheiro, corpo perfeito, aprovação digital, poder, consumo, sucesso a qualquer custo. Quando a aparência vale mais que a verdade, tudo vira performance. Quando o aplauso vale mais que a consciência, a pessoa se perde.\n" +
    "\n" +
    "A arte é legítima. A cultura é viva. O entretenimento pode ser descanso e expressão. O problema começa quando o espetáculo substitui o sentido.\n" +
    "\n" +
    "Mas há também o perigo oposto: **quando a fé vira arma.** Quando o nome de Deus justifica ódio. Quando a espiritualidade é sequestrada pela intolerância. Quando a linguagem do amor é usada para condenar. Quando a religião deixa de ser caminho de encontro e passa a ser instrumento de poder.\n" +
    "\n" +
    "A intolerância religiosa aprendeu a usar a linguagem da fé para parecer amor. Diz *\"estou te alertando\"* enquanto despreza. Diz *\"estou orando por você\"* enquanto exclui.\n" +
    "\n" +
    "**O sagrado não precisa de crueldade para se sustentar. A fé que apaga a compaixão já perdeu o centro. A verdade que humilha não liberta — apenas domina.**\n" +
    "\n" +
    "O ser humano precisa de sentido, beleza, mistério, transcendência, pertencimento. Mas precisa também de lucidez. O sagrado pode libertar; a idolatria pode aprisionar. A fé pode humanizar; o dogma pode desumanizar. A diferença está no respeito à vida.\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## V. AS FERRAMENTAS DE DOMINAÇÃO\n" +
    "\n" +
    "### A tecnologia\n" +
    "\n" +
    "Ela cura, conecta, facilita, descobre. Mas também vigia, manipula, polariza, transforma atenção em produto e guerra em espetáculo. A tecnologia não é neutra. Depende de quem a financia, quem a controla, quem lucra com ela.\n" +
    "\n" +
    "Dizer que o futuro é tecnológico sem perguntar *a serviço de quem* é apenas propaganda. Se concentra poder, precariza o trabalho, alimenta-se de dados pessoais e aumenta a capacidade de destruição, não é progresso. **É disputa.** E sem ética, será mais uma ferramenta de dominação.\n" +
    "\n" +
    "### A linguagem\n" +
    "\n" +
    "Querem chamar guerra de política, invasão de ordem, massacre de estratégia, morte de efeito colateral. A linguagem do poder tenta higienizar o crime. Mas a guerra, vista de baixo, é casa destruída, criança morta, mãe sem filho, fome, medo, trauma, fuga.\n" +
    "\n" +
    "O que é assassinato precisa ser chamado de assassinato. O que é roubo precisa ser chamado de roubo. O que é opressão precisa ser chamado de opressão. **Se aceitamos as palavras deles, aceitamos o mundo deles.**\n" +
    "\n" +
    "### O medo\n" +
    "\n" +
    "O medo é a principal ferramenta de condicionamento. Ensina a antecipar o castigo. Faz a pessoa se calar antes de ser silenciada. Encolher-se antes de ser atacada. Aceitar menos do que merece porque aprendeu que desejar é perigoso.\n" +
    "\n" +
    "Medo de falar. De olhar. De ser visto. De amar. De ser amado. De errar. De desejar. De mudar. De existir sem máscara.\n" +
    "\n" +
    "Uma sociedade que produz medo produz obediência. Quem vive com medo aceita qualquer promessa de segurança: líderes cruéis, verdades falsas, relações ruins, trabalhos destrutivos, religiões opressoras, normalidades doentes. O medo paralisa. Faz o futuro parecer repetição do pior. E quando o futuro é só ameaça, a pessoa desiste de criar.\n" +
    "\n" +
    "**A coragem não é ausência de medo. É a decisão de não deixar o medo governar.**\n" +
    "\n" +
    "### A inversão de valores\n" +
    "\n" +
    "O fraco moral não é quem chora, sente, erra, pede ajuda. O fraco moral é quem mata, humilha, explora, tortura, destrói — e ainda posa de civilizado. Transformar vítima em problema e opressor em autoridade é uma das armas mais eficazes da dominação.\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## VI. A AMÉRICA LATINA NÃO É QUINTAL\n" +
    "\n" +
    "A América Latina não é atrasada, carente, caótica, perigosa. Essa narrativa foi construída para justificar saque. Se somos inferiores, é fácil explorar. Se somos caóticos, é fácil controlar. Se somos perigosos, é fácil intervir.\n" +
    "\n" +
    "Mas a América Latina é memória, resistência, corpo, floresta, rio, língua, sabedoria ancestral, criatividade e luta. Guarda formas de viver que o mundo precisa reaprender. Uma delas: **a Terra não é depósito, não é mercadoria. É casa, corpo, mãe, origem e condição da vida.**\n" +
    "\n" +
    "Tratar a natureza como recurso infinito é suicídio coletivo. Desmatamento, envenenamento de rios, expulsão de comunidades, morte de lideranças, mineração predatória — nada disso é progresso. É repetição da lógica colonial com tecnologia nova. Tirar, concentrar, destruir e culpar os pobres pela miséria.\n" +
    "\n" +
    "Desenvolvimento não pode significar destruição. Futuro não pode ser construído sobre terra arrasada. Riqueza não pode ser acumulação de poucos à custa da fome de muitos.\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## VII. A LIBERDADE SITUADA\n" +
    "\n" +
    "Se somos condicionados, podemos ser recondicionados. Se aprendemos padrões, podemos questioná-los. Se fomos treinados para obedecer, podemos aprender a escolher.\n" +
    "\n" +
    "A liberdade não é ausência de influência. Ninguém nasce fora da cultura, da linguagem, da família, da história. **A liberdade real é a capacidade de tomar posição diante do que nos formou.** Não escolhemos tudo o que nos aconteceu. Mas podemos escolher o que faremos com aquilo que fizeram de nós.\n" +
    "\n" +
    "Existência vem antes de essência. Não somos destino fechado. Somos ser em construção. Mas essa construção não ocorre no vazio: ocorre dentro de condições concretas — corpo, classe, território, história, trauma, acesso, linguagem, medo, desejo.\n" +
    "\n" +
    "A liberdade não é mágica. É situada. E justamente por isso precisa ser defendida socialmente. Não basta dizer que todos são livres se alguns não têm tempo, pão, casa, saúde, educação ou segurança.\n" +
    "\n" +
    "**Liberdade sem condições materiais vira discurso. Liberdade real exige dignidade concreta.**\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## VIII. AUTENTICIDADE E REBELDIA\n" +
    "\n" +
    "A autenticidade nasce quando deixamos de confundir valor com aprovação. Há uma ditadura silenciosa da perfeição: corpo perfeito, rosto perfeito, família perfeita, fé perfeita, desempenho perfeito, felicidade permanente. Mas a vida real é atravessada por contradições, quedas, dúvidas, cansaços, desejos, recomeços.\n" +
    "\n" +
    "A imperfeição não é mancha. É prova de vida. Um corpo envelhecido não é menos belo. Uma vida simples não é inferior.\n" +
    "\n" +
    "Ser autêntico não é transformar tudo em confissão pública. É recusar viver como personagem. Não trocar verdade por aceitação. Não vender o rosto para caber no mundo. Não apagar a própria história para ser aceito por quem nunca nos viu de verdade.\n" +
    "\n" +
    "A rebeldia necessária não é destruição. É lucidez. Os rebeldes percebem o condicionamento. Entendem que o mundo não precisa ser como está. Que obediência nem sempre é virtude. Que normalidade nem sempre é saúde. Que ordem nem sempre é justiça. Que sucesso nem sempre é vida.\n" +
    "\n" +
    "Há rebeldes silenciosos. Rebeldes que cuidam. Que plantam. Que estudam. Que escrevem. Que amam. Que não se vendem. Que dizem não quando todos dizem sim. Que permanecem humanos quando o mundo pede frieza. Que escolhem verdade quando a mentira é conveniente. Que defendem a vida quando a vida não dá lucro.\n" +
    "\n" +
    "**A rebeldia começa na mente.** Surge quando questionamos os dados que recebemos. Se aprendemos que somos mercadoria, podemos aprender que somos vida. Se aprendemos que medo é destino, podemos aprender que coragem é prática. Se aprendemos que obedecer é seguro, podemos aprender que consciência é risco necessário. Se aprendemos que o mundo é assim mesmo, podemos perceber que ele foi feito assim — e pode ser desfeito.\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## IX. O CUSTO\n" +
    "\n" +
    "A liberdade custa caro. Mas a submissão custa mais.\n" +
    "\n" +
    "Quanto custa acordar todos os dias sendo quem você não é? Quanto custa trabalhar até o esgotamento para enriquecer quem não te vê? Quanto custa aceitar que sua vida seja medida pelo que você produz? Quanto custa silenciar sua dor para não incomodar? Quanto custa morrer por dentro para continuar aceito por fora?\n" +
    "\n" +
    "Se você não defende sua liberdade, alguém a transforma em produto. Se não protege seu tempo, alguém o vende. Se não cuida da sua verdade, alguém a substitui por narrativa. Se não ocupa sua vida, alguém a ocupa por você.\n" +
    "\n" +
    "Liberdade não é apenas fazer o que se quer. É ter condições reais de existir com dignidade. Voz, escolha, tempo, pão, casa, saúde, vínculo, paz. Liberdade sem justiça é privilégio. Liberdade sem responsabilidade é caos. **Liberdade verdadeira é compromisso com a vida — a própria e a dos outros.**\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## X. A FINITUDE E O DESPERTAR\n" +
    "\n" +
    "A morte precisa ser encarada. Não para romantizar o fim, mas para aprender a viver. A consciência da finitude destrói a ilusão de tempo infinito. Ela diz: *ame agora, fale agora, escolha agora, defenda agora, viva agora.*\n" +
    "\n" +
    "Perder a vida não é apenas morrer fisicamente. É existir sem presença. Trabalhar sem sentido. Amar sem verdade. Crer sem amor. Obedecer sem consciência. Aceitar o inaceitável. Trocar o essencial por distração. Esquecer que somos finitos.\n" +
    "\n" +
    "É melhor morrer defendendo dignidade do que viver morto por dentro. Essa frase não glorifica a morte — glorifica a vida. Afirma que há algo mais importante do que apenas sobreviver: **existir com sentido.** E sentido não se compra. Sentido se constrói.\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## XI. A ESCOLHA\n" +
    "\n" +
    "Nossa capacidade de previsão pode ser prisão, mas também pode ser porta. Se repete padrões, aprisiona. Se se abre a novas experiências, liberta. A vida nova começa quando inserimos novos dados: encontro, estudo, silêncio, natureza, amor, luta, verdade, justiça, beleza, cuidado.\n" +
    "\n" +
    "No fim, a questão é simples e dura: **o que faremos com a vida que ainda está em nossas mãos?**\n" +
    "\n" +
    "Podemos obedecer por hábito. Consumir por vazio. Temer por treinamento. Fingir por conveniência. Aceitar o inaceitável por cansaço. Viver como se não fôssemos morrer. Trocar o essencial por conforto. Vender nosso tempo até sobrar só exaustão.\n" +
    "\n" +
    "Ou podemos despertar.\n" +
    "\n" +
    "Despertar é reconhecer que somos iguais em dignidade, livres em natureza e condicionados por histórias que podem ser interrogadas. É não aceitar que a vida seja medida apenas por lucro. É defender tempo, terra, verdade, corpo, amor, justiça e consciência. É viver sem máscara, mesmo quando a máscara seria mais fácil. É escolher presença em vez de fuga. Responsabilidade em vez de submissão.\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## XII. A VIDA NÃO SE VENDE\n" +
    "\n" +
    "A vida não é produto. É tarefa, escolha, luta e vínculo. É finita, mas não é pequena. Frágil, mas não é desprezível. Incerta, mas não é vazia. Pode ser dura, mas também pode ser bela. E só se torna verdadeiramente bela quando deixamos de ser mercadoria e voltamos a ser gente.\n" +
    "\n" +
    "Gente com história no rosto. Gente com medo no peito, mas coragem nas mãos. Gente que erra, aprende, cai, levanta. Gente que ama. Que cuida. Que pensa. Que questiona. Que recusa ser vendida.\n" +
    "\n" +
    "**A vida não se vende.**\n" +
    "**A vida se vive.**";

  function updateStatus() {
    if (status && textarea) {
      var lines = textarea.value.split("\n").length;
      var chars = textarea.value.length;
      status.textContent = "Ln " + lines + ", " + chars + " caracteres";
    }
  }

  if (textarea) {
    textarea.value = NOTEPAD_TEXT;
    textarea.addEventListener("input", updateStatus);
    textarea.addEventListener("keydown", function (e) {
      if (e.key === "Tab") {
        e.preventDefault();
        var s = textarea.selectionStart;
        var v = textarea.value;
        textarea.value = v.slice(0, s) + "  " + v.slice(textarea.selectionEnd);
        textarea.selectionStart = textarea.selectionEnd = s + 2;
        updateStatus();
      }
    });
  }

  if (typeof WindowBehavior !== "undefined" && win) {
    var behavior = new WindowBehavior(win, {
      dragHandle: dragHandle,
      btnClose: btnClose,
      btnMinimize: btnMinimize,
      btnMaximize: btnMaximize,
      minW: 420,
      minH: 300,
      taskbarIcon:
        '<img src="system/assets/icons/tango2kde/16x16/apps/kwrite.png" alt="" width="14" height="14" style="flex-shrink:0;">',
      taskbarLabel: __("notepad.title"),
      taskbarAction: "notepad",
      appId: "notepad",
      onShow: function () {
        if (win) {
          win.style.width = "720px";
          win.style.height = "560px";
        }
        updateStatus();
      },
      onHide: function () {},
    });
    window.notepadBehavior = behavior;
  }

  if (typeof W2K !== "undefined" && W2K && W2K.AppRegistry) {
    W2K.AppRegistry.register("notepad", {
      label: __("notepad.title"),
      show: function () {
        if (window.notepadBehavior) window.notepadBehavior.show();
      },
      minimize: function () {
        if (window.notepadBehavior) window.notepadBehavior.minimize();
      },
      hasEntry: function () {
        return window.notepadBehavior ? window.notepadBehavior.hasTaskbarEntry() : false;
      },
    });
  }
})();