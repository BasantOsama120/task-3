// مصفوفة حفظ بيانات الطلاب
const studentsList = [];

// عناصر الشاشة
const studentForm = document.getElementById("studentForm");
const studentNameInput = document.getElementById("studentName");
const grade1Input = document.getElementById("grade1");
const grade2Input = document.getElementById("grade2");
const grade3Input = document.getElementById("grade3");
const attendanceInput = document.getElementById("attendance");
const errorBox = document.getElementById("errorBox");
const studentsListBox = document.getElementById("studentsList");
const studentsCount = document.getElementById("studentsCount");
const mercyBtn = document.getElementById("mercyBtn");
const reportBox = document.getElementById("reportBox");

// كلاس الطالب مع استخدام Private Fields لحماية البيانات
class Student {
  #grade1;
  #grade2;
  #grade3;
  #attendance;

  constructor(name, grade1, grade2, grade3, attendance) {
    if (!name || !name.trim()) {
      throw new Error("من فضلك أدخل اسم الطالب.");
    }

    this.name = name.trim();
    this.grade1 = grade1;
    this.grade2 = grade2;
    this.grade3 = grade3;
    this.attendance = attendance;
  }

  set grade1(value) { this.#grade1 = this.validateNumber(value, "درجة المادة الأولى"); }
  get grade1() { return this.#grade1; }

  set grade2(value) { this.#grade2 = this.validateNumber(value, "درجة المادة الثانية"); }
  get grade2() { return this.#grade2; }

  set grade3(value) { this.#grade3 = this.validateNumber(value, "درجة المادة الثالثة"); }
  get grade3() { return this.#grade3; }

  set attendance(value) { this.#attendance = this.validateNumber(value, "نسبة الحضور"); }
  get attendance() { return this.#attendance; }

  validateNumber(value, fieldName) {
    if (value === "" || value === null || value === undefined) {
      throw new Error(`حقل ${fieldName} مطلوب ولا يمكن تركه فارغًا.`);
    }

    const number = Number(value);
    if (!Number.isFinite(number) || number < 0 || number > 100) {
      throw new Error(`${fieldName} يجب أن تكون رقمًا من 0 إلى 100.`);
    }

    return number;
  }

  get average() {
    return (this.#grade1 + this.#grade2 + this.#grade3) / 3;
  }
}

// عرض الطلاب على الشاشة
function renderStudents() {
  studentsCount.textContent = `${studentsList.length} طالب`;

  if (studentsList.length === 0) {
    studentsListBox.innerHTML = '<div class="empty-state">لم تتم إضافة أي طالب حتى الآن.</div>';
    return;
  }

  studentsListBox.innerHTML = studentsList.map((student, index) => `
    <div class="student-item">
      <div>
        <div class="student-name">${index + 1}. ${escapeHTML(student.name)}</div>
        <div class="student-meta">الحضور: ${student.attendance}%</div>
      </div>
      <span class="average-pill">المتوسط: ${student.average.toFixed(2)}</span>
    </div>
  `).join("");
}

// منع عرض أي HTML قد يكتبه المستخدم كأنه كود
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

// إضافة طالب
studentForm.addEventListener("submit", function (event) {
  event.preventDefault();
  errorBox.textContent = "";
  errorBox.classList.add("d-none");

  try {
    const student = new Student(
      studentNameInput.value,
      grade1Input.value,
      grade2Input.value,
      grade3Input.value,
      attendanceInput.value
    );

    studentsList.push(student);
    renderStudents();
    studentForm.reset();
    reportBox.innerHTML = '<div class="empty-state">تم تحديث قائمة الطلاب. اضغط على لجنة الرأفة لعرض التقرير.</div>';
  } catch (error) {
    errorBox.textContent = error.message;
    errorBox.classList.remove("d-none");
  }
});

// لجنة الرأفة: Filter ثم Map ثم Reduce
mercyBtn.addEventListener("click", function () {
  const strugglingStudents = studentsList.filter(student =>
    student.average >= 40 && student.average <= 49
  );

  if (strugglingStudents.length === 0) {
    reportBox.innerHTML = `
      <div class="empty-state">
        لا يوجد طلاب متوسط درجاتهم بين 40 و49، لذلك لا توجد حالات تحتاج إلى لجنة الرأفة.
      </div>
      <div class="mt-3 text-secondary small">عدد الطلاب المتعثرين: 0</div>
    `;
    return;
  }

  const studentsAfterMercy = strugglingStudents.map(student => ({
    name: student.name,
    oldAverage: student.average,
    newAverage: student.average + 5
  }));

  const totalAfterMercy = studentsAfterMercy.reduce(
    (total, student) => total + student.newAverage,
    0
  );

  const generalAverage = totalAfterMercy / studentsAfterMercy.length;

  const studentsHTML = studentsAfterMercy.map((student, index) => `
    <div class="report-student d-flex justify-content-between align-items-center gap-2">
      <div>
        <strong>${index + 1}. ${escapeHTML(student.name)}</strong>
        <div class="student-meta">قبل الرأفة: ${student.oldAverage.toFixed(2)}</div>
      </div>
      <span class="average-pill">بعد الرأفة: ${student.newAverage.toFixed(2)}</span>
    </div>
  `).join("");

  reportBox.innerHTML = `
    <div class="report-summary">
      <div class="summary-chip">عدد الطلاب المتعثرين: <strong>${studentsAfterMercy.length}</strong></div>
      <div class="summary-chip">المتوسط العام بعد الرأفة: <strong>${generalAverage.toFixed(2)}</strong></div>
    </div>
    <h3 class="section-title fs-6 mb-2">تفاصيل الطلاب</h3>
    ${studentsHTML}
    <p class="text-secondary small mt-3 mb-0">تمت إضافة 5 درجات إلى متوسط كل طالب ضمن الحالات المحددة في التقرير.</p>
  `;
});
