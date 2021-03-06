function calcHelp()
{
	var first = document.getElementById("first").value;
	var cards = document.getElementById("cards").value;
	var wins = document.getElementById("wins").value;
	var ponders = document.getElementById("ponders").value;
	var preordains = document.getElementById("preordains").value;
	var brainstorms = document.getElementById("brainstorms").value;
	var blueMana = document.getElementById("mana").value;

	var prob = calculate(parseInt(first), parseInt(cards), parseInt(wins), parseInt(ponders), parseInt(preordains), parseInt(brainstorms), parseInt(blueMana));

	prob *= 100
	var stringProb = "" + prob;
	stringProb = stringProb.substring(0,2);
	var outputArea = document.getElementById("output");

	outputArea.innerHTML = "<p>Probability of winning is: " + stringProb + "%</p>";

}
function brainstorm(x, y)
{
	return 1.0 - (((x - y) / x) * ((x - y - 1) / (x - 1) * ((x - y - 2) / (x - 2))));
}
function ponder(x,y)
{
	return 1.0 - ((((x - y) / x) * (((x - y) / x) * ((x - y - 1) / (x - 1) * ((x - y - 2) / (x - 2))))));
}
function joint(cardA, cardB, totalCards)
{
	return 6.0 * cardA / totalCards * cardB / (totalCards - 1) - 3 * cardA / totalCards * cardB / (totalCards - 1) * (cardA - 1) / (totalCards - 2) - 3 * cardA / totalCards * cardB / (totalCards - 1) * (cardB - 1) / (totalCards - 2)
}
function threeCards(cardA, cardB, cardC, totalCards)
{
	return 6 * cardA * cardB * cardC / (totalCards * (totalCards - 1) * (totalCards - 2));
}
function twoCards(cardA, cardB, totalCards)
{
	return 2 * cardA * cardB / (totalCards * (totalCards - 1));
}
function twoLookPonder(x,y)
{
	return 1.0 - ((((x - y) / x) * (((x - y) / x) * ((x - y - 1) / (x - 1)))));
}
function twoLookBrainstorm(x,y)
{
	return 1.0 - (((x - y) / x) * ((x - y - 1) / (x - 1)));
}
function oneLookPonder(x,y)
{
	return y/(x-2) + y/(x);
}
function oneLookBrainstorm(x,y)
{
	return y/(x-2);
}
function makeSetPonder(cardFunction, oneLookCardFunction, cards, wins, ponders, preordains, brainstorms)
{
	var ponderShuffle = (1 - (brainstorm(cards, (wins + ponders + preordains + brainstorms + 1))));

	var winVal = ponderShuffle * (cardFunction(cards, wins)) + (1-ponderShuffle) * oneLookCardFunction(cards, wins);

	var ponderVal = ponderShuffle * (cardFunction(cards, ponders) - joint(ponders, wins, cards)) + (1-ponderShuffle) * oneLookCardFunction(cards, ponders);

	var preordainVal = ponderShuffle * (cardFunction(cards, preordains) - joint(preordains, wins, cards) - joint(preordains, ponders, cards) + threeCards(preordains, ponders, wins, cards)) + (1-ponderShuffle) * (oneLookCardFunction(cards,preordains));

	var brainstormVal = ponderShuffle * (cardFunction(cards, brainstorms) - joint(brainstorms, wins, cards) - joint(brainstorms, ponders, cards) - joint(brainstorms, preordains, wins) + threeCards(brainstorms, ponders, wins, cards) + threeCards(brainstorms, preordains, wins, cards) + threeCards(brainstorms, ponders, preordains, cards)) +  (1-ponderShuffle) * oneLookCardFunction(cards, brainstorms);

	var missVal = 1 - winVal - preordainVal - ponderVal	- preordainVal;

	return [winVal, ponderVal, preordainVal, brainstormVal, missVal]; 
}
function makeSetPreordain(cardFunction, twoLookCardFunction, cards, wins, ponders, preordains, brainstorms)
{
	var bottomBoth = 1 - twoLookBrainstorm(cards, (wins + ponders + preordains + brainstorms + 1));
	var bottomNone = (wins + ponders + preordains + brainstorms + 1)/cards * (wins + ponders + preordains + brainstorms)/(cards-1);
	var bottomOne = 1 - bottomBoth - bottomNone;

	var winVal = bottomBoth * (cardFunction(cards-2, wins)) + bottomOne * (twoLookCardFunction(cards-1, wins)) + bottomNone * (twoLookCardFunction(cards, wins));
	var ponderVal = bottomBoth * (cardFunction(cards-2, ponders) - joint(ponders, wins, cards-2)) + bottomOne * (twoLookCardFunction(cards-1, ponders) - twoCards(wins, ponders, cards-1)) + bottomNone * (twoLookCardFunction(cards,ponders) - twoCards(wins, ponders, cards));
	var preordainVal = bottomBoth * (cardFunction(cards-2, preordains) - joint(preordains, wins, cards-2) - joint(preordains, ponders, cards-2) + threeCards(wins, ponders, preordains, cards-2)) + bottomOne * (twoLookCardFunction(cards-1, preordains) - twoCards(wins, preordains, cards-1) - twoCards(preordains, ponders, cards-1)) + bottomNone * (twoLookCardFunction(cards,preordains) - twoCards(wins, preordains, cards) - twoCards(preordains, ponders, cards));

	var brainstormVal = bottomBoth * (cardFunction(cards-2, brainstorms) - joint(brainstorms, wins, cards-2) - joint(brainstorms, ponders, cards-2) -joint(brainstorms, preordains, cards-2) + threeCards(brainstorms, ponders, wins, cards-2) + threeCards(brainstorms, preordains, wins, cards-2) + threeCards(brainstorms, ponders, preordains, cards-2)) + bottomOne * (twoLookCardFunction(cards-1, brainstorms) - twoCards(wins, brainstorms, cards-1) - twoCards(brainstorms, ponders, cards-1) - twoCards(brainstorms, preordains, cards-1)) + bottomNone * (twoLookCardFunction(cards,brainstorms) - twoCards(wins, brainstorms, cards) - twoCards(brainstorms, ponders, cards) - twoCards(brainstorms, preordains, cards));

	var missVal = 1 - winVal - preordainVal - ponderVal	- preordainVal;

	return [winVal, ponderVal, preordainVal, brainstormVal, missVal];
}
function makeSetBrainstorm(cardFunction, oneLookCardFunction, cards, wins, ponders, preordains, brainstorms)
{
	var winVal = oneLookCardFunction(cards-2, wins);
	var ponderVal = oneLookCardFunction(cards-2, ponders);
	var preordainVal = oneLookCardFunction(cards-2, preordains);
	var brainstormVal = oneLookCardFunction(cards-2, brainstorms);
			var missVal = 1 - winVal - preordainVal - ponderVal	- preordainVal;

	return [winVal, ponderVal, preordainVal, brainstormVal, missVal];
}
function calculate(firstCantrip, cards, wins, ponders, preordains, brainstorms, blueMana)
{

	var n0 = {name: "head"};
	var n1 = {name: "A"};
	var n2 = {name: "B"};
	var n3 = {name: "C"};
	var n4 = {name: "D"};

	n1.parents = [n0];
	n2.parents = [n0,n1];
	n3.parents = [n1,n2];
	n4.parents = [n2,n3];

	n0.cpt = [.34,.33,.33];

	n1.cpt = [
				[
					ponder(cards, wins),
					ponder(cards, ponders-1) - joint(ponders-1 ,wins, cards),
					ponder(cards, preordains) - joint(preordains, wins, cards) - joint(preordains, ponders-1, cards) + threeCards(preordains, ponders-1, wins, cards),
					ponder(cards, brainstorms) - joint(brainstorms, wins, cards) - joint(brainstorms, ponders-1, cards) - joint(brainstorms, preordains, cards) + threeCards(brainstorms, ponders-1, wins, cards) + threeCards(brainstorms, preordains, wins, cards),

					1-ponder(cards, (wins + ponders + preordains + brainstorms-1))
				],
				[
					brainstorm(cards, wins),
					brainstorm(cards, ponders) - twoCards(wins, ponders, cards),
					brainstorm(cards, preordains-1) - twoCards(wins, preordains, cards) - twoCards(preordains-1, ponders, cards),
					brainstorm(cards, brainstorms) - twoCards(wins, brainstorms, cards) - twoCards(brainstorms, ponders, cards) - twoCards(brainstorms, preordains-1, cards),
					1-brainstorm(cards, (wins + ponders + preordains + brainstorms-1))
				],
				[
					brainstorm(cards, wins),
					brainstorm(cards, ponders) - joint(ponders,wins, cards),
					brainstorm(cards, preordains) - joint(preordains, wins, cards) - joint(preordains, ponders, cards) + threeCards(preordains, ponders, wins, cards),
					brainstorm(cards, brainstorms-1) - joint(brainstorms-1, wins, cards) - joint(brainstorms-1, ponders, cards) - joint(brainstorms-1, preordains, cards) + threeCards(brainstorms-1, ponders, wins, cards) + threeCards(brainstorms-1, preordains, wins, cards),

					1-brainstorm(cards, (wins + ponders + preordains + brainstorms-1))
				]
			];
	cards--;

	n2.cpt = [
				[
					[1.0,0.0,0.0,0.0,0.0], //ponder, win
					makeSetPonder(ponder, oneLookPonder, cards, wins, ponders-2, preordains, brainstorms), //ponder, ponder
					makeSetPonder(brainstorm, oneLookBrainstorm, cards, wins, ponders-1, preordains-1, brainstorms), //ponder, preordain
					makeSetPonder(brainstorm, oneLookBrainstorm, cards, wins, ponders-1, preordains, brainstorms-1), //ponder, brainstorm
					[0.0,0.0,0.0,0.0,1.0], //ponder, miss
				],
				[
					[1.0,0.0,0.0,0.0,0.0], //preordain, win
					makeSetPreordain(ponder, oneLookPonder, cards, wins, ponders-1, preordains-1, brainstorms), //preordain, ponder
					makeSetPreordain(brainstorm, oneLookBrainstorm, cards, wins, ponders, preordains-2, brainstorms), //preordain, preordain
					makeSetPreordain(brainstorm, oneLookBrainstorm, cards, wins, ponders, preordains-1, brainstorms-1), //preordain, brainstorm
					[0.0,0.0,0.0,0.0,1.0], //preordain, miss
				],
				[
					[1.0,0.0,0.0,0.0,0.0], //brainstorm, win
					makeSetBrainstorm(ponder, oneLookPonder, cards, wins, ponders-1, preordains, brainstorms-1), //brainstorm, ponder
					makeSetBrainstorm(brainstorm, oneLookBrainstorm, cards, wins, ponders, preordains-1, brainstorms-1), //brainstorm, preordain
					makeSetBrainstorm(brainstorm, oneLookBrainstorm, cards, wins, ponders, preordains, brainstorms-2), //brainstorm, brainstorm
					[0.0,0.0,0.0,0.0,1.0], //brainstorm, miss
				]
			];

	cards--;

	n3.cpt = [
			[
				[1.0,0.0,0.0,0.0,0.0], //win, win
				[0.0,0.0,0.0,0.0,0.0], //win, ponder
				[0.0,0.0,0.0,0.0,0.0], //win, preordain
				[0.0,0.0,0.0,0.0,0.0], //win, brainstorm
				[0.0,0.0,0.0,0.0,0.0], //win, miss
			],
			[
				[1.0,0.0,0.0,0.0,0.0], //ponder, win
				makeSetPonder(ponder, oneLookPonder, cards, wins, ponders-2, preordains, brainstorms), //ponder, ponder
				makeSetPonder(brainstorm, oneLookBrainstorm, cards, wins, ponders-1, preordains-1, brainstorms), //ponder, preordain
				makeSetPonder(brainstorm, oneLookBrainstorm, cards, wins, ponders-1, preordains, brainstorms-1), //ponder, brainstorm
				[0.0,0.0,0.0,0.0,1.0], //ponder, miss
			],
			[
				[1.0,0.0,0.0,0.0,0.0], //preordain, win
				makeSetPreordain(ponder, oneLookPonder, cards, wins, ponders-1, preordains-1, brainstorms), //preordain, ponder
				makeSetPreordain(brainstorm, oneLookBrainstorm, cards, wins, ponders, preordains-2, brainstorms), //preordain, preordain
				makeSetPreordain(brainstorm, oneLookBrainstorm, cards, wins, ponders, preordains-1, brainstorms-1), //preordain, brainstorm
				[0.0,0.0,0.0,0.0,1.0], //preordain, miss
			],
			[
				[1.0,0.0,0.0,0.0,0.0], //brainstorm, win
				makeSetBrainstorm(ponder, oneLookPonder, cards, wins, ponders-1, preordains, brainstorms-1), //brainstorm, ponder
				makeSetBrainstorm(brainstorm, oneLookBrainstorm, cards, wins, ponders, preordains-1, brainstorms-1), //brainstorm, preordain
				makeSetBrainstorm(brainstorm, oneLookBrainstorm, cards, wins, ponders, preordains, brainstorms-2), //brainstorm, brainstorm
				[0.0,0.0,0.0,0.0,1.0], //brainstorm, miss
			],
			[
				[0.0,0.0,0.0,0.0,0.0], //miss, win
				[0.0,0.0,0.0,0.0,0.0], //miss, ponder
				[0.0,0.0,0.0,0.0,0.0], //miss, preordain
				[0.0,0.0,0.0,0.0,0.0], //miss, brainstorm
				[0.0,0.0,0.0,0.0,1.0]  //miss, miss
			]
		];

	cards--;

	var ponderXponder = makeSetPonder(ponder, oneLookPonder, cards, wins, ponders-2, preordains, brainstorms);
	var ponderXpreordain = makeSetPonder(brainstorm, oneLookBrainstorm, cards, wins, ponders-1, preordains-1, brainstorms);
	var ponderXbrainstorm = makeSetPonder(brainstorm, oneLookBrainstorm, cards, wins, ponders-1, preordains, brainstorms-1);

	var preordainXponder = makeSetPreordain(ponder, oneLookPonder, cards, wins, ponders-1, preordains-1, brainstorms);
	var preordainXpreordain = makeSetPreordain(brainstorm, oneLookBrainstorm, cards, wins, ponders, preordains-2, brainstorms);
	var preordainXbrainstorm = makeSetPreordain(brainstorm, oneLookBrainstorm, cards, wins, ponders, preordains-1, brainstorms-1);

	var brainstormXponder = makeSetBrainstorm(ponder, oneLookPonder, cards, wins, ponders-1, preordains, brainstorms-1);
	var brainstormXpreordain = makeSetBrainstorm(brainstorm, oneLookBrainstorm, cards, wins, ponders, preordains-1, brainstorms-1);
	var brainstormXbrainstorm = makeSetBrainstorm(brainstorm, oneLookBrainstorm, cards, wins, ponders, preordains, brainstorms-2);
	n4.cpt = [
				[
					[1.0,0.0], //win, win
					[0.0,0.0], //win, ponder
					[0.0,0.0], //win, preordain
					[0.0,0.0], //win, brainstorm
					[0.0,0.0], //win, miss
				],
				[	
					[1.0,0.0], //ponder, win
					[ponderXponder[0], ponderXponder[4]], //ponder, ponder
					[ponderXpreordain[0], ponderXpreordain[4]], //ponder, preordain
					[ponderXbrainstorm[0], ponderXbrainstorm[4]], //ponder, brainstorm
					[0.0,1.0], //ponder, miss
				],
				[
					[1.0,0.0], //preordain, win
					[preordainXponder[0], preordainXponder[4]], //preordain, ponder
					[preordainXpreordain[0], preordainXpreordain[4]], //preordain, preordain
					[preordainXbrainstorm[0], preordainXbrainstorm[4]], //preordain, brainstorm
					[0.0,1.0], //preordain, miss
				],
				[
					[1.0,0.0], //brainstorm, win
					[brainstormXponder[0], brainstormXponder[4]], //brainstorm, ponder
					[brainstormXpreordain[0], brainstormXpreordain[4]], //brainstorm, preordain
					[brainstormXbrainstorm[0], brainstormXbrainstorm[4]], //brainstorm, brainstorm
					[0.0,1.0], //brainstorm, miss
				],
				[
					[0.0,0.0], //miss, win
					[0.0,0.0], //miss, ponder
					[0.0,0.0], //miss, preordain
					[0.0,0.0], //miss, brainstorm
					[0.0,1.0]  //miss, miss
				]
			];
	var network = [n0,n1,n2,n3,n4];
	n0.fixed = true;
	n0.value = firstCantrip; //set to brainstorm
	n1.value = -1;
	n2.value = -1;
	n3.value = -1;
	n4.value = -1;
	var sampleWins = 0;
	var samples = 1000000;
	for(var i = 0; i < samples; i++)
	{
		var sample = Array();
		for(var j = 0; j < 5; j++)
		{
			if(!network[j].fixed)
			{
				var rand = Math.random();
				var sum = 0;
				var parents = network[j].parents;
				if(parents.length == 2)
				{
					var flag = true
					for(var k = 0; k < network[j].cpt[parents[0].value][parents[1].value].length; k++)
					{	
						sum += network[j].cpt[parents[0].value][parents[1].value][k];
						if(rand < sum)
						{
							network[j].value = k;
							flag = false
							break;
						}
					}
					if(flag)
					{
						network[j].value = network[j].cpt[parents[0].value][parents[1].value].length-1;
					}
				}
				else
				{
					var flag = true;
					for(var k = 0; k < network[j].cpt[parents[0].value].length; k++)
					{	
						sum += network[j].cpt[parents[0].value][k];
						if(rand < sum)
						{
							network[j].value = k;
							flag = false;
							break;
						}

					}
					if(flag)
					{
						network[j].value = network[j].cpt[parents[0].value].length-1;
					}
				}
			}
		}
		if(network[blueMana].value == 0)
		{
			sampleWins++;
		}
	}
	return sampleWins/samples;
}