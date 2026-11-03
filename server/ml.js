/**
 * Anime Nexus - Logistic Regression Machine Learning Engine
 * Implements a complete binary classification model from first principles:
 * - Sigmoid hypothesis function: h_theta(x) = 1 / (1 + exp(-z))
 * - Feature standardization (StandardScaler fitted strictly on training split)
 * - Binary Cross-Entropy Loss (Log Loss) with L2 Ridge Regularization
 * - Gradient Descent Optimization
 * - Model Evaluation: Accuracy, Precision, Recall, F1 Score, Confusion Matrix
 * - Feature Importance / Coefficient Analysis
 */

class AnimeLogisticRegression {
  constructor() {
    this.weights = [];
    this.bias = 0;
    this.scaler = { mean: [], std: [] };
    this.featureNames = [
      'MAL Rating Score',
      'Studio Prestige Index',
      'Genre Mass Appeal',
      'Recency / Release Year',
      'Episode Scale',
      'Story Lore Depth'
    ];
    this.metrics = null;
    this.isTrained = false;
    this.trainingHistory = [];
  }

  /**
   * Sigmoid activation function with numerical overflow protection
   */
  sigmoid(z) {
    if (z > 40) return 1.0;
    if (z < -40) return 0.0;
    return 1.0 / (1.0 + Math.exp(-z));
  }

  /**
   * Feature extraction from anime object
   */
  extractFeatures(anime) {
    // 1. Rating (float)
    const rating = parseFloat(anime.rating) || 7.5;

    // 2. Studio Prestige Index (1.0 - 3.0)
    const topTierStudios = ['ufotable', 'madhouse', 'mappa', 'bones', 'kyoto animation', 'wit studio', 'gainax'];
    const midTierStudios = ['cloverworks', 'pierrot', 'production i.g', 'shaft', 'a-1 pictures', 'toei animation', 'studio trigger'];
    const s = (anime.studio || '').toLowerCase();
    let studioScore = 1.0;
    if (topTierStudios.some(ts => s.includes(ts))) studioScore = 3.0;
    else if (midTierStudios.some(ms => s.includes(ms))) studioScore = 2.0;

    // 3. Genre Mass Appeal (1.0 - 2.5)
    const cat = (anime.category || '').toLowerCase();
    let genreScore = 1.5;
    if (['action', 'shounen'].includes(cat)) genreScore = 2.5;
    else if (['mystery', 'romance', 'summer'].includes(cat)) genreScore = 2.0;
    else if (['spring', 'winter', 'autumn'].includes(cat)) genreScore = 1.8;

    // 4. Recency / Release Year
    const year = parseInt(anime.year, 10) || 2018;

    // 5. Episode Scale (numeric)
    let epCount = 12;
    if (typeof anime.episodes === 'string') {
      const match = anime.episodes.match(/\d+/);
      if (match) epCount = parseInt(match[0], 10);
      else if (anime.episodes.toLowerCase().includes('movie')) epCount = 1;
    }

    // 6. Story Lore Depth (description word length)
    const loreLen = (anime.description || '').split(/\s+/).length;

    return [rating, studioScore, genreScore, year, epCount, loreLen];
  }

  /**
   * Determine ground truth target label (1 = Blockbuster Hit, 0 = Niche/Cult Gem)
   */
  getTarget(anime) {
    const rating = parseFloat(anime.rating) || 7.5;
    const cat = (anime.category || '').toLowerCase();
    const isTopCategory = ['action', 'shounen', 'mystery'].includes(cat);

    // Criteria: High rating and (high-traffic category OR exceptional rating >= 8.5)
    return (rating >= 8.4 && (isTopCategory || rating >= 8.7)) ? 1 : 0;
  }

  /**
   * Strict Featurization Ordering:
   * Fit StandardScaler parameters (mean & std) strictly on training set.
   */
  fitScaler(X_train) {
    const numFeatures = this.featureNames.length;
    const mean = new Array(numFeatures).fill(0);
    const std = new Array(numFeatures).fill(0);
    const n = X_train.length;

    // Calculate mean
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < numFeatures; j++) {
        mean[j] += X_train[i][j];
      }
    }
    for (let j = 0; j < numFeatures; j++) {
      mean[j] /= n;
    }

    // Calculate standard deviation
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < numFeatures; j++) {
        const diff = X_train[i][j] - mean[j];
        std[j] += diff * diff;
      }
    }
    for (let j = 0; j < numFeatures; j++) {
      std[j] = Math.sqrt(std[j] / n) || 1.0; // avoid division by zero
    }

    this.scaler = { mean, std };
  }

  /**
   * Transform features using fitted scaler parameters
   */
  transform(X) {
    return X.map(row => row.map((val, j) => (val - this.scaler.mean[j]) / this.scaler.std[j]));
  }

  /**
   * Train Logistic Regression Model using Gradient Descent with L2 Regularization
   */
  train(dataset, { learningRate = 0.08, iterations = 600, lambdaReg = 0.01, testSplitRatio = 0.2 } = {}) {
    console.log(`[ML] Training Logistic Regression Model on ${dataset.length} anime entries...`);

    // 1. Prepare Features & Labels
    const allX = dataset.map(a => this.extractFeatures(a));
    const allY = dataset.map(a => this.getTarget(a));

    // 2. Deterministic Train/Test Split (80% train, 20% test)
    const totalSamples = dataset.length;
    const testCount = Math.floor(totalSamples * testSplitRatio);
    const trainCount = totalSamples - testCount;

    // Shuffle with seeded order
    const indices = Array.from({ length: totalSamples }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = (i * 37 + 11) % (i + 1);
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const X_train_raw = [];
    const y_train = [];
    const X_test_raw = [];
    const y_test = [];

    for (let i = 0; i < totalSamples; i++) {
      const idx = indices[i];
      if (i < trainCount) {
        X_train_raw.push(allX[idx]);
        y_train.push(allY[idx]);
      } else {
        X_test_raw.push(allX[idx]);
        y_test.push(allY[idx]);
      }
    }

    // 3. Strict Featurization Ordering: Fit scaler on training set only!
    this.fitScaler(X_train_raw);
    const X_train = this.transform(X_train_raw);
    const X_test = this.transform(X_test_raw);

    // 4. Initialize Weights & Bias
    const numFeatures = this.featureNames.length;
    this.weights = new Array(numFeatures).fill(0).map(() => (Math.random() - 0.5) * 0.1);
    this.bias = 0.0;
    this.trainingHistory = [];

    // 5. Gradient Descent Loop
    const m = X_train.length;
    for (let iter = 0; iter < iterations; iter++) {
      const dw = new Array(numFeatures).fill(0);
      let db = 0;
      let totalLoss = 0;

      for (let i = 0; i < m; i++) {
        // Linear combination: z = w·x + b
        let z = this.bias;
        for (let j = 0; j < numFeatures; j++) {
          z += this.weights[j] * X_train[i][j];
        }

        const y_hat = this.sigmoid(z);
        const err = y_hat - y_train[i];

        // Gradients
        for (let j = 0; j < numFeatures; j++) {
          dw[j] += err * X_train[i][j];
        }
        db += err;

        // Log Loss
        const eps = 1e-15;
        const clippedHat = Math.max(eps, Math.min(1 - eps, y_hat));
        totalLoss += -(y_train[i] * Math.log(clippedHat) + (1 - y_train[i]) * Math.log(1 - clippedHat));
      }

      // Update weights with L2 regularization
      for (let j = 0; j < numFeatures; j++) {
        const regTerm = (lambdaReg / m) * this.weights[j];
        this.weights[j] -= learningRate * ((dw[j] / m) + regTerm);
      }
      this.bias -= learningRate * (db / m);

      if (iter % 50 === 0 || iter === iterations - 1) {
        this.trainingHistory.push({
          iteration: iter,
          loss: parseFloat((totalLoss / m).toFixed(4))
        });
      }
    }

    // 6. Evaluate Model on Test Set (Out-of-sample generalization)
    this.metrics = this.evaluate(X_test, y_test);
    this.isTrained = true;

    console.log(`[ML] Model trained successfully!`);
    console.log(`[ML] Test Accuracy: ${(this.metrics.accuracy * 100).toFixed(1)}% | Precision: ${(this.metrics.precision * 100).toFixed(1)}% | F1 Score: ${this.metrics.f1.toFixed(3)}`);
    console.log(`[ML] Confusion Matrix: TP=${this.metrics.confusionMatrix.tp}, FP=${this.metrics.confusionMatrix.fp}, TN=${this.metrics.confusionMatrix.tn}, FN=${this.metrics.confusionMatrix.fn}`);

    return this.metrics;
  }

  /**
   * Evaluate predictions against ground truth labels
   */
  evaluate(X, y) {
    let tp = 0, fp = 0, tn = 0, fn = 0;

    for (let i = 0; i < X.length; i++) {
      let z = this.bias;
      for (let j = 0; j < this.weights.length; j++) {
        z += this.weights[j] * X[i][j];
      }
      const prob = this.sigmoid(z);
      const pred = prob >= 0.5 ? 1 : 0;
      const actual = y[i];

      if (pred === 1 && actual === 1) tp++;
      else if (pred === 1 && actual === 0) fp++;
      else if (pred === 0 && actual === 0) tn++;
      else if (pred === 0 && actual === 1) fn++;
    }

    const accuracy = (tp + tn) / (tp + tn + fp + fn || 1);
    const precision = tp / (tp + fp || 1);
    const recall = tp / (tp + fn || 1);
    const f1 = (2 * precision * recall) / (precision + recall || 1);

    return {
      accuracy: parseFloat(accuracy.toFixed(3)),
      precision: parseFloat(precision.toFixed(3)),
      recall: parseFloat(recall.toFixed(3)),
      f1: parseFloat(f1.toFixed(3)),
      confusionMatrix: { tp, fp, tn, fn },
      testSampleSize: X.length
    };
  }

  /**
   * Predict single anime instance
   */
  predict(anime) {
    const rawFeatures = this.extractFeatures(anime);
    const scaledFeatures = rawFeatures.map((val, j) => (val - this.scaler.mean[j]) / this.scaler.std[j]);

    let z = this.bias;
    const contributions = [];

    for (let j = 0; j < this.weights.length; j++) {
      const term = this.weights[j] * scaledFeatures[j];
      z += term;
      contributions.push({
        feature: this.featureNames[j],
        weight: parseFloat(this.weights[j].toFixed(3)),
        scaledValue: parseFloat(scaledFeatures[j].toFixed(2)),
        impact: parseFloat(term.toFixed(3))
      });
    }

    const probability = this.sigmoid(z);
    const isPopular = probability >= 0.5;

    // Human readable explanation
    let tier = 'Cult Classic / Niche Gem';
    let badgeColor = '#f59e0b';
    if (probability >= 0.8) {
      tier = 'Universal Blockbuster Hit 🔥';
      badgeColor = '#ef4444';
    } else if (probability >= 0.6) {
      tier = 'High Mainstream Hit ⚡';
      badgeColor = '#38bdf8';
    } else if (probability >= 0.4) {
      tier = 'Balanced / Acclaimed Work 🌸';
      badgeColor = '#a855f7';
    }

    return {
      isPopular,
      probability: parseFloat((probability * 100).toFixed(1)),
      tier,
      badgeColor,
      logit: parseFloat(z.toFixed(2)),
      featureContributions: contributions.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)),
      explanation: `Predicted with ${(probability * 100).toFixed(1)}% probability based on ${contributions[0].feature} (impact: ${contributions[0].impact > 0 ? '+' : ''}${contributions[0].impact}) and ${contributions[1].feature}.`
    };
  }

  /**
   * Return full model summary for UI diagnostics
   */
  getModelSummary() {
    return {
      isTrained: this.isTrained,
      featureNames: this.featureNames,
      weights: this.weights.map((w, i) => ({
        feature: this.featureNames[i],
        coefficient: parseFloat(w.toFixed(3)),
        importance: Math.abs(w)
      })).sort((a, b) => b.importance - a.importance),
      bias: parseFloat(this.bias.toFixed(3)),
      metrics: this.metrics,
      trainingHistory: this.trainingHistory,
      formula: `P(Popular=1) = σ(${this.bias.toFixed(2)} + ${this.weights.map((w, i) => `${w.toFixed(2)}·x_${i+1}`).join(' + ')})`
    };
  }
}

const mlEngine = new AnimeLogisticRegression();

module.exports = {
  mlEngine
};
