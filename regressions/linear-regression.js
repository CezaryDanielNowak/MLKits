const tf = require('@tensorflow/tfjs');
const _ = require('lodash')
class LinearRegressor {
  constructor({ features, labels, ...options }) {
    this.features = features;
    this.labels = labels;
    this.options = {
      learningRate: 0.1,
      maxLearningIterations: 1000,
      iterations: null,
      ...options,
    };

    this.m = 0;
    this.b = 0;
  }

  gradientDescent() {
    const currentGuessesForMPG = this.features.map((row) => {
      return this.m * row[0] + this.b;
    });

    const bSlope = _.sum(currentGuessesForMPG.map((guess, i) => {
      return guess - this.labels[i][0];
    })) * 2 / this.features.length;

    const mSlope = _.sum(currentGuessesForMPG.map((guess, i) => {
      return -1 * this.features[i][0] * (this.labels[i][0] - guess);
    })) * 2 / this.features.length;


    this.m = this.m - mSlope * this.options.learningRate;
    this.b = this.b - bSlope * this.options.learningRate;
  }


  train() {
    for (let i = 0; i < this.options.iterations; ++i) {
      this.gradientDescent();
    }
  }

}

module.exports = LinearRegressor;
