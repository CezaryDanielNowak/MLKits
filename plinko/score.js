const outputs = [];

function onScoreUpdate(dropPosition, bounciness, size, bucketLabel) {
  outputs.push([dropPosition, bounciness, size, bucketLabel]);
}

const ROW_DROP_POSITION = 0;
const ROW_BOUCINESS = 1;
const ROW_SIZE = 2;
const ROW_BUCKET_LABEL = 3;

const k = 3; // k as for K-Nearest neighbors
const predictionPoint = 300;

function getMeaningfullChoices(inputLodashChainArr, minK) {
	let edgeElement = null;

	return inputLodashChainArr.takeWhile(([ drop_position ], i) => {
		if (i + 1 === minK) {
			edgeElement = drop_position;
			return true;
		} else if (i < minK) {
			return true;
		} else {
			return drop_position === edgeElement;
		}
	});
}

function runAnalysis() {
  const testSize = 100;


  _.range(0, 3).forEach((feature) => {
    const data = _.map(outputs, (row) => [row[feature], _.last(row)]);

    const [testSet, trainingSet] = splitDataset(minMax(data), testSize);

    const accuracy = _.chain(testSet)
      .filter(testPoint => knn(trainingSet, _.initial(testPoint), 10) === _.last(testPoint))
      .size()
      .divide(testSize)
      .value();

    console.log(`accuracy for feature=${feature} is ${accuracy}`);
  });

}

function knn(data, point, k = 0) {
  let meaningfullChoices;

	const choices = _.chain(data)
  	.map((row) => {
      return [
        distance(_.initial(row), point),
        _.last(row)
      ];
    })
  	.sortBy(row => row[0]);

  if (k === 0) { // 0 === auto
	  meaningfullChoices = getMeaningfullChoices(choices, 3);
	} else {
    meaningfullChoices = choices.slice(0, k);
	}

  return meaningfullChoices
  	.countBy(row => row[1])
  	.toPairs()
  	.sortBy(row => row[1])
  	.last()
  	.first()
  	.parseInt()
  	.value();

}

function distance(pointA, pointB) {
  return _.chain(pointA)
    .zip(pointB)
    .map(([a, b]) => (a - b) ** 2)
    .sum()
    .value() ** 0.5;
}

function splitDataset(data, testCount) {
  if (data.length <= testCount) {
    alert('No enough data to perform test!');
    return [[], []];
  }

  const shuffled = _.shuffle(data);

  const testSet = _.slice(shuffled, 0, testCount);
  const trainingSet = _.slice(shuffled, testCount);

  return [testSet, trainingSet];
}

function minMax(data, featureCount = _.first(data).length - 1) {
  const clonedData = _.cloneDeep(data);

  for (let i = 0; i < featureCount; ++i) {
    const column = clonedData.map((row) => row[i]);

    const min = _.min(column);
    const max = _.max(column);
    const divider = max - min || 0.00000001; // don't divide by 0

    for (let j = 0; j < clonedData.length; ++j) {
      clonedData[j][i] = (clonedData[j][i] - min) / divider;
    }
  }

  return clonedData;
}
