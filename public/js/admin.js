// --------------------
// Reusable fetch helper
// --------------------
async function sendRequest(url, options) {
  try {
    const res = await fetch(url, { ...options, credentials: "same-origin" });

    const contentType = res.headers.get("Content-Type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    }

    if (!res.ok) {
      console.error("Request failed:", res.status, data);
      alert(data?.error || "Operation failed");
      return null;
    }

    return data || true;

  } catch (err) {
    console.error("Server error:", err);
    alert("Server error");
    return null;
  }
}

// --------------------
// Courses
// --------------------
async function updateCourse(btn) {
  const form = btn.closest("form");
  const id = form.querySelector("input[name='courseID']").value;
  const payload = {
    name: form.querySelector("input[name='name']").value.trim(),
    level: form.querySelector("input[name='level']").value.trim()
  };

  const success = await sendRequest(`/admin/course/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (success) alert("Successfully updated course. Please reload the page.");
}

async function deleteCourse(id) {
  if (!confirm("Are you sure you want to delete this course?")) return;

  const success = await sendRequest(`/admin/course/${id}`, { method: "DELETE" });
  if (success) alert("Successfully deleted course. Please reload the page.");
}

// --------------------
// Faculty
// --------------------
async function updateFaculty(btn) {
  const form = btn.closest("form");
  const id = form.querySelector("input[name='facultyID']").value;
  const payload = {
    fname: form.querySelector("input[name='fname']").value.trim(),
    lname: form.querySelector("input[name='lname']").value.trim(),
    qualification: form.querySelector("input[name='qualification']").value.trim(),
    dateJoined: form.querySelector("input[name='dateJoined']").value
  };

  const success = await sendRequest(`/admin/faculty/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (success) alert("Successfully updated faculty. Please reload the page.");
}

async function deleteFaculty(id) {
  if (!confirm("Are you sure you want to delete this faculty?")) return;

  const success = await sendRequest(`/admin/faculty/${id}`, { method: "DELETE" });
  if (success) alert("Successfully deleted faculty. Please reload the page.");
}

// --------------------
// Faculty-Course relation
// --------------------
async function addFacultyCourse(btn) {
  const form = btn.closest("form");
  const facultyID = form.querySelector("input[name='facultyID']").value;
  const courseID = form.querySelector("input[name='courseID']").value;

  if (!facultyID || !courseID) {
    return alert("Faculty ID and Course ID are required");
  }

  const success = await sendRequest("/admin/faculty_course", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ faculty_id: facultyID, course_id: courseID })
  });

  if (success) alert("Successfully added course. Please reload the page.");
}

async function deleteFacultyCourse(btn) {
  const form = btn.closest("form");
  const facultyID = form.querySelector("input[name='facultyID']").value;
  const courseID = form.querySelector("input[name='courseID']").value;

  if (!facultyID || !courseID) {
    return alert("Faculty ID and Course ID are required");
  }

  const success = await sendRequest(`/admin/faculty/${facultyID}/courses/${courseID}`, { method: "DELETE" });
  if (success) alert("Successfully deleted course. Please reload the page.");
}

// --------------------
// Enquiry
// --------------------
async function updateEnquiry(btn) {
  const form = btn.closest("form");
  const id = form.querySelector("input[name='id']").value.trim();
  const answer = form.querySelector("input[name='answer']").value.trim();
  const isVisible = form.querySelector("input[name='is_visible']").checked;

  const payload = { is_visible: isVisible };
  if (answer !== "") payload.answer = answer;

  const success = await sendRequest(`/admin/enquiry/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (success) alert("Successfully updated enquiry. Please reload the page.");
}

async function deleteEnquiry(id) {
  if (!confirm("Are you sure you want to delete this enquiry?")) return;

  const success = await sendRequest(`/admin/enquiry/${id}`, { method: "DELETE" });
  if (success) alert("Successfully deleted enquiry. Please reload the page.");
}