var GROUPS = [
  {
    "group": "あ",
    "content": [
      ["あ", "ア", "a"],
      ["い", "イ", "i"],
      ["う", "ウ", "u"],
      ["え", "エ", "e"],
      ["お", "オ", "o"]
    ]
  },
  {
    "group": "か",
    "content": [
      ["か", "カ", "ka"],
      ["き", "キ", "ki"],
      ["く", "ク", "ku"],
      ["け", "ケ", "ke"],
      ["こ", "コ", "ko"]
    ]
  },
  {
    "group": "さ",
    "content": [
      ["さ", "サ", "sa"],
      ["し", "シ", "shi"],
      ["す", "ス", "su"],
      ["せ", "セ", "se"],
      ["そ", "ソ", "so"]
    ]
  },
  {
    "group": "た",
    "content": [
      ["た", "タ", "ta"],
      ["ち", "チ", "chi"],
      ["つ", "ツ", "tsu"],
      ["て", "テ", "te"],
      ["と", "ト", "to"]
    ]
  },
  {
    "group": "な",
    "content": [
      ["な", "ナ", "na"],
      ["に", "ニ", "ni"],
      ["ぬ", "ヌ", "nu"],
      ["ね", "ネ", "ne"],
      ["の", "ノ", "no"]
    ]
  },
  {
    "group": "は",
    "content": [
      ["は", "ハ", "ha"],
      ["ひ", "ヒ", "hi"],
      ["ふ", "フ", "fu"],
      ["へ", "ヘ", "he"],
      ["ほ", "ホ", "ho"]
    ]
  },
  {
    "group": "ま",
    "content": [
      ["ま", "マ", "ma"],
      ["み", "ミ", "mi"],
      ["む", "ム", "mu"],
      ["め", "メ", "me"],
      ["も", "モ", "mo"]
    ]
  },
  {
    "group": "や",
    "content": [
      ["や", "ヤ", "ya"],
      ["ゆ", "ユ", "yu"],
      ["よ", "ヨ", "yo"]
    ]
  },
  {
    "group": "ら",
    "content": [
      ["ら", "ラ", "ra"],
      ["り", "リ", "ri"],
      ["る", "ル", "ru"],
      ["れ", "レ", "re"],
      ["ろ", "ロ", "ro"]
    ]
  },
  {
    "group": "わ",
    "content": [
      ["わ", "ワ", "wa"],
      ["を", "ヲ", "wo"],
      ["ん", "ン", "n"]
    ]
  },
]

const DURATIONS = [
  {
    text: "30 秒",
    value: 30 * 1000,
  },
  {
    text: "1 分钟",
    value: 60 * 1000,
  },
  {
    text: "2 分钟",
    value: 2 * 60 * 1000,
  },
  {
    text: "3 分钟",
    value: 3 * 60 * 1000,
  },
  {
    text: "4 分钟",
    value: 4 * 60 * 1000,
  },
  {
    text: "5分钟",
    value: 5 * 60 * 1000,
  },
]

const successSound = new Howl({
  src: ["success.mp3"],
})

const errorSound = new Howl({
  src: ["error.mp3"],
})

// 是否以 PWA 模式运行
const runningAsPWA = () => window.matchMedia('(display-mode: standalone)').matches

// 是否含有 home indicator
const hasHomeIndicator = () => {
  if(!navigator.userAgent.match(/iPhone/i)) return false

  const h = window.screen.height
  const w = window.screen.width

  return (w === 414 && h === 896) || // XMAX, XR
    (w === 375 && h === 812) // X, XS
}

// fix safari 100vh problem
Vue.directive("full-height", el => {
  let height = window.innerHeight

  // 减去底部的 Home Indicator
  if(runningAsPWA() && hasHomeIndicator()) {
    height -= 32
  }

  el.style.height = height + "px"
})

Vue.component("card", {
  template: "#card",

  props: {
    duration: {
      type: Object,
      required: true,
    },

    indexes: {
      type: Array,
      required: true,
    },
  },

  data() {
    return {
      progress: 100,
      practice: {},
    }
  },

  computed: {
    progressWidth() {
      return `${this.progress}%`
    },

    practiceData() {
      return this.indexes.map(i => GROUPS[i].content).reduce((acc, arr) => acc.concat(arr))
    },
  },

  mounted() {
    this.start()
  },

  destroyed() {
    clearInterval(this.intervalHandle)
  },

  methods: {
    genPractice() {
      this.practiceCount += 1
      return [this.gen1, this.gen2, this.gen3, this.gen4][_.random(3)](this.practiceData)
    },

    // 平假名到片假名
    gen1(data) {
      const candidates = _.sampleSize(this.practiceData, 4)
      const targetIndex = _.random(candidates.length - 1)

      if(this.lastPracticeQuestion === candidates[targetIndex][0]) return this.gen1(data)

      this.lastPracticeQuestion = candidates[targetIndex][0]

      return {
        question: candidates[targetIndex][0],
        desc: "选择平假名对应的片假名",
        answers: candidates.map(i => i[1]),
        correctIdx: targetIndex,
      }
    },

    // 片假名到平假名
    gen2(data) {
      const candidates = _.sampleSize(this.practiceData, 4)
      const targetIndex = _.random(candidates.length - 1)

      if(this.lastPracticeQuestion === candidates[targetIndex][1]) return this.gen2(data)

      this.lastPracticeQuestion = candidates[targetIndex][1]

      return {
        question: candidates[targetIndex][1],
        desc: "选择片假名对应的平假名",
        answers: candidates.map(i => i[0]),
        correctIdx: targetIndex,
      }
    },

    // 罗马音到平假名
    gen3(data) {
      const candidates = _.sampleSize(this.practiceData, 4)
      const targetIndex = _.random(candidates.length - 1)

      if(this.lastPracticeQuestion === candidates[targetIndex][2]) return this.gen3(data)

      this.lastPracticeQuestion = candidates[targetIndex][2]

      return {
        question: candidates[targetIndex][2],
        desc: "选择罗马音对应的平假名",
        answers: candidates.map(i => i[0]),
        correctIdx: targetIndex,
      }
    },

    // 罗马音到片假名
    gen4(data) {
      const candidates = _.sampleSize(this.practiceData, 4)
      const targetIndex = _.random(candidates.length - 1)

      if(this.lastPracticeQuestion === candidates[targetIndex][2]) return this.gen4(data)

      this.lastPracticeQuestion = candidates[targetIndex][2]

      return {
        question: candidates[targetIndex][2],
        desc: "选择罗马音对应的片假名",
        answers: candidates.map(i => i[1]),
        correctIdx: targetIndex,
      }
    },

    onSelect(idx) {
      if(idx === this.practice.correctIdx) {
        this.handleCorrect(idx)
      } else {
        this.handleWrong(idx)
      }
    },

    handleCorrect(idx) {
      const el = this.$refs.answer[idx]
      el.classList.add("card__answer--correct")
      successSound.play()
      setTimeout(() => {
        el.classList.remove("card__answer--correct")
        this.next()
      }, 500)
    },

    next() {
      this.practice = this.genPractice()
    },

    handleWrong(idx) {
      this.wrongCount += 1
      const el = this.$refs.answer[idx]
      el.classList.add("card__answer--wrong")
      el.addEventListener("animationend", () => {
        el.classList.remove("card__answer--wrong")
      })
      errorSound.play()
    },

    onCancel() {
      this.$emit("cancel")
    },

    end() {
      const intervalPerPractice = (Date.now() - this.startTime) / this.practiceCount / 1000

      let msg = ""

      if(this.wrongCount > 0) {
        msg += `错误次数：${this.wrongCount}\n\n`
      }

      msg += `平均时间：${intervalPerPractice.toFixed(2)}S`

      swal({
        title: "复习结束",
        text: msg,
        icon: "success",
        buttons: ["返回首页", "继续复习"],
      })
        .then(value => {
          if(value) {
            this.start()
          } else {
            this.$emit("cancel")
          }
        })
    },

    start() {
      this.progress = 100
      this.wrongCount = 0
      this.practiceCount = 0
      this.startTime = Date.now()
      this.practice = this.genPractice()
      this.startProgress()
    },

    startProgress() {
      const unit = 100 / (this.duration.value / 1000)

      this.intervalHandle = setInterval(() => {
        const value = this.progress - unit
        if(value <= 0) {
          this.progress = 0
          clearInterval(this.intervalHandle)
          this.end()
        } else {
          this.progress = value
        }
      }, 1000)
    },
  },
})

new Vue({
  el: "#app",

  data: {
    started: false,
    GROUPS,
    DURATIONS,
    duration: DURATIONS[0],
    groupIndexes: [],
  },

  computed: {
    allSelected() {
      return this.groupIndexes.length === this.GROUPS.length
    },
  },

  methods: {
    toggleSelect(idx) {
      const i = this.groupIndexes.indexOf(idx)

      if(i === -1) {
        this.groupIndexes.push(idx)
      } else {
        this.groupIndexes.splice(i, 1)
      }
    },

    toggleSelectAll(evt) {
      if(this.allSelected) {
        this.groupIndexes = []
      } else {
        this.groupIndexes = _.range(this.GROUPS.length)
      }
    },
  },
})
