// Quiz areas
const quizInitContainer = document.querySelector('.quiz-init');
const quizGameContainer = document.querySelector('.quiz-game');
const quizCongratulationsContainer = document.querySelector('.quiz-congratulations');

// Quiz init container elements
const playerForm = document.querySelector('.player-form');
const playerNameField = document.querySelector('.player-name');

// Quiz game container elements
const greetings = document.querySelector('.greetings');
const questionAndAnswers = document.querySelector('.questions-and-answers');
const questionsCounter = document.querySelector('.questions-counter');
const btnNextQuestion = document.querySelector('.btn-next');
const btnPreviousQuestion = document.querySelector('.btn-previous');

// Quiz congratulations container elements
const quizResult = document.querySelector('.quiz-result');
const btnStartAgain = document.querySelector('.btn-start-again');
const btnDownloadCertificate = document.querySelector('.btn-download-certificate');
const btnPreviewCertificate = document.querySelector('.btn-preview-certificate');
const certificateCanvas = document.getElementById('certificateCanvas');
const certificateModal = document.getElementById('certificateModal');
const closeModal = document.querySelector('.close-modal');
const previewContainer = document.getElementById('previewContainer');

// General elements
let playerName = 'Anonymous';
let totalQuestionsValue = 0;
let currentQuestionIndex = 0;
let currenQuestionCorrectAnswerIndex = 0;
let lastQuestionIndex = 0;
let score = 0;
let isAbleToPlusScore = true;
let isAnAnswerSelected = false;
let isAbleToDecreaseScore = true;

// Funtions
function finishQuiz() {
  quizCongratulationsContainer.classList.remove('set-none');
  quizResult.textContent = `
  All in all, got it right ${score} of ${totalQuestionsValue} questions`;
  
  if (score > 0) {
    btnDownloadCertificate.style.display = 'inline-block';
    btnPreviewCertificate.style.display = 'inline-block';
    generateCertificate();
  } else {
    btnDownloadCertificate.style.display = 'none';
    btnPreviewCertificate.style.display = 'none';
  }
}

function generateCertificate() {
  const ctx = certificateCanvas.getContext('2d');
  
  // Set canvas dimensions
  certificateCanvas.width = 800;
  certificateCanvas.height = 600;
  
  // Draw border
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 800, 600);
  
  ctx.strokeStyle = '#21B573';
  ctx.lineWidth = 20;
  ctx.strokeRect(20, 20, 760, 560);
  
  ctx.strokeStyle = '#2d3436';
  ctx.lineWidth = 5;
  ctx.strokeRect(40, 40, 720, 520);
  
  // Add Text
  ctx.fillStyle = '#2d3436';
  ctx.textAlign = 'center';
  
  ctx.font = 'bold 45px Arial';
  ctx.fillText('CERTIFICATE OF ACHIEVEMENT', 400, 150);
  
  ctx.font = '25px Arial';
  ctx.fillText('This is to certify that', 400, 220);
  
  ctx.font = 'italic bold 50px Times New Roman';
  ctx.fillStyle = '#21B573';
  ctx.fillText(playerName, 400, 300);
  
  ctx.fillStyle = '#2d3436';
  ctx.font = '25px Arial';
  ctx.fillText('has successfully completed the', 400, 370);
  
  ctx.font = 'bold 35px Arial';
  ctx.fillText('PYTHON QUIZ', 400, 430);
  
  ctx.font = '20px Arial';
  ctx.fillText(`with a score of ${score} out of ${totalQuestionsValue}`, 400, 480);
  
  ctx.font = 'italic 18px Arial';
  ctx.fillText(new Date().toLocaleDateString(), 400, 530);
}

function showCertificatePreview() {
  const imageData = certificateCanvas.toDataURL('image/png');
  previewContainer.innerHTML = `<img src="${imageData}" alt="Certificate Preview">`;
  certificateModal.style.display = 'block';
}

function downloadCertificate() {
  const image = certificateCanvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `${playerName}_Python_Quiz_Certificate.png`;
  link.href = image;
  link.click();
}

function goToNextQuestion() {
  if (isAnAnswerSelected && currentQuestionIndex < totalQuestionsValue - 1) {
    isAnAnswerSelected = false;
    isAbleToPlusScore = true;
    currentQuestionIndex++;
    isAbleToDecreaseScore = false;
    updateQuizQuestions();
  } else if (isAnAnswerSelected && currentQuestionIndex === totalQuestionsValue - 1) {
    setTimeout(() => {
      quizGameContainer.classList.add('set-none');
      finishQuiz();
    }, 500);
  }
}

function goToPreviousQuestion() {
  if (currentQuestionIndex > 0) {
    isAnAnswerSelected = false;
    isAbleToPlusScore = true;
    currentQuestionIndex--;
    isAbleToDecreaseScore = false;
    updateQuizQuestions();
  }
}


function selectThisAnswer(answer) {
  const allAnswers = document.querySelectorAll('.answer');
  allAnswers.forEach((eachAnswer) => eachAnswer.classList.remove('selected'));

  answer.classList.add('selected');
  isAnAnswerSelected = true;

  const currentAnswerIndex = Number(answer.dataset.index);
  const areTheSameIndex = currentAnswerIndex === currenQuestionCorrectAnswerIndex;
  
  if (areTheSameIndex && isAbleToPlusScore) {
    score++;
    isAbleToPlusScore = false;
    isAbleToDecreaseScore = true;
  } else if (areTheSameIndex && isAnAnswerSelected) {
    score = score;
    isAbleToPlusScore = false;
  } else if (isAbleToDecreaseScore) {
    score--;
    if (score < 0) score = 0
    isAbleToPlusScore = true;
    isAbleToDecreaseScore = false;
  }
}

function generateAnswersTemplate(answers) {
  return answers.reduce((acc, answer, index) => {
    acc += `<p class="answer" onclick="selectThisAnswer(this)" data-index="${index}">${answer}</p>`;
    return acc;
  }, '');
}

function generateQuestionTemplate({ 
  id, question, answers, correct 
}) {
  currenQuestionCorrectAnswerIndex = correct;
  questionsCounter.textContent = `${id} of ${totalQuestionsValue} questions.`;

  const answersTemplate = generateAnswersTemplate(answers);
  return `
    <h1 class="question">Q${id}. ${question}</h1>
    <div class="answers">${answersTemplate}</div>
  `;
}

async function getQuestionDatas() {
  const data = await (await (fetch('./questions.json'))).json();
  totalQuestionsValue = data.length;
  return data[currentQuestionIndex];
}

async function updateQuizQuestions() {
  const questionData = await getQuestionDatas();
  const questionTemplate = generateQuestionTemplate(questionData);
  
  questionAndAnswers.innerHTML = questionTemplate;
  greetings.textContent = `Welcome! ${playerName}`;
}

function startQuiz() {
  quizGameContainer.classList.remove('set-none');
  updateQuizQuestions();
}

function resetQuiz() {
  playerName = 'Anonymous';
  totalQuestionsValue = 0;
  currentQuestionIndex = 0;
  currenQuestionCorrectAnswerIndex = 0;
  lastQuestionIndex = 0;
  score = 0;
  isAbleToPlusScore = true;
  isAnAnswerSelected = false;
  isAbleToDecreaseScore = true;

  setTimeout(() => {
    quizCongratulationsContainer.classList.add('set-none');
    startQuiz();
  }, 500);
}

function handleFormSubmit(e) {
  e.preventDefault();
  
  const playerNameFieldValue = playerNameField.value.trim();
  playerName = playerNameFieldValue !== ''
    ? playerNameFieldValue
    : 'Anonymous';
    
  quizInitContainer.classList.add('hidden');
  setTimeout(() => {
    quizInitContainer.classList.remove('hidden');
    quizInitContainer.classList.add('set-none');
    startQuiz();
  }, 500);
}

// Event Listeners
playerForm.addEventListener('submit', handleFormSubmit);
btnNextQuestion.addEventListener('click', goToNextQuestion);
btnPreviousQuestion.addEventListener('click', goToPreviousQuestion);
btnStartAgain.addEventListener('click', redirectToHomePage);
btnDownloadCertificate.addEventListener('click', downloadCertificate);
btnPreviewCertificate.addEventListener('click', showCertificatePreview);
closeModal.onclick = () => certificateModal.style.display = 'none';
window.onclick = (event) => {
  if (event.target == certificateModal) {
    certificateModal.style.display = 'none';
  }
}

function redirectToHomePage() {
  window.location.href = './../index.html'; // Replace 'index.html' with your actual home page URL
}

function redirectToHomePage() {
  window.location.href = './../index.html'; // Replace 'index.html' with your actual home page URL
}
