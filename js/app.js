const storage = (table) => {
  if (!localStorage.getItem(table)) {
    localStorage.setItem(table, JSON.stringify({}));
  }

  const get = (key = null) => {
    let data = JSON.parse(localStorage.getItem(table));
    return key ? data[key] : data;
  };

  const set = (key, value) => {
    let storage = get();
    storage[key] = value;
    localStorage.setItem(table, JSON.stringify(storage));
  };

  const unset = (key) => {
    let storage = get();
    delete storage[key];
    localStorage.setItem(table, JSON.stringify(storage));
  };

  const has = (key) => Object.keys(get()).includes(key);

  return {
    get: get,
    set: set,
    unset: unset,
    has: has,
  };
};

const request = (method, path) => {
  let url = document.querySelector("body").getAttribute("data-url");
  let req = {
    method: method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  if (url.slice(-1) == "/") {
    url = url.slice(0, -1);
  }

  return {
    async then(...params) {
      return fetch(url + path, req)
        .then((res) => res.json())
        .then((res) => {
          if (res.error !== null) {
            throw res.error[0];
          }

          return res;
        })
        .then(...params);
    },
    token(token) {
      req.headers["Authorization"] = "Bearer " + token;
      return this;
    },
    body(body) {
      req.body = JSON.stringify(body);
      return this;
    },
  };
};

const util = (() => {
  const opacity = (nama) => {
    let nm = document.getElementById(nama);
    let op = parseInt(nm.style.opacity);
    let clear = null;

    clear = setInterval(() => {
      if (op >= 0) {
        nm.style.opacity = op.toString();
        op -= 0.025;
      } else {
        clearInterval(clear);
        clear = null;
        nm.remove();
        return;
      }
    }, 10);
  };

  const escapeHtml = (unsafe) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  let clear = null;
  const salin = (btn, msg = "Tersalin", timeout = 1500) => {
    navigator.clipboard
      .writeText(btn.getAttribute("data-nomer"))
      .then(() => {
        let tmp = btn.innerHTML;
        btn.innerHTML = msg;
        btn.disabled = true;
        let dataBank = btn.getAttribute("data-nomer");
        if (btn.getAttribute("data-bank") === `BNI: `) {
          document.querySelector(`.js-generate-gifthtml`).innerHTML = `<img
                            class="img-fluid"
                            style="height: 15px"
                            src="https://upload.wikimedia.org/wikipedia/id/thumb/5/55/BNI_logo.svg/640px-BNI_logo.svg.png"
                            alt=""
                          /><p>${dataBank}</p>`;
        } else if (btn.getAttribute("data-bank") === `BRI: `) {
          document.querySelector(`.js-generate-gifthtml`).innerHTML = `<img
                            class="img-fluid"
                            style="height: 15px"
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/BANK_BRI_logo.svg/640px-BANK_BRI_logo.svg.png"
                            alt=""
                          /><p>${dataBank}</p>`;
        } else {
          document.querySelector(
            `.js-generate-gifthtml`
          ).innerHTML = `<i class="fa-solid fa-map-location-dot me-2"></i
                          ><p>${dataBank}</p>`;
        }
        clear = setTimeout(() => {
          btn.innerHTML = tmp;
          btn.disabled = false;
          btn.focus();

          clearTimeout(clear);
          clear = null;
          return;
        }, timeout);
      })
      .catch(() => {
        alert(`copy failed`);
      });
  };

  const timer = () => {
    let countDownDate = new Date(
      document
        .getElementById("tampilan-waktu")
        .getAttribute("data-waktu")
        .replace(" ", "T")
    ).getTime();

    setInterval(() => {
      let distance = Math.abs(countDownDate - new Date().getTime());

      document.getElementById("hari").innerText = Math.floor(
        distance / (1000 * 60 * 60 * 24)
      );
      document.getElementById("jam").innerText = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      document.getElementById("menit").innerText = Math.floor(
        (distance % (1000 * 60 * 60)) / (1000 * 60)
      );
      document.getElementById("detik").innerText = Math.floor(
        (distance % (1000 * 60)) / 1000
      );
    }, 1000);
  };

  const play = (btn) => {
    if (btn.getAttribute("data-status") !== "true") {
      btn.setAttribute("data-status", "true");
      audio.play();
      btn.innerHTML = '<i class="fa-solid fa-circle-pause fa-spin"></i>';
    } else {
      btn.setAttribute("data-status", "false");
      audio.pause();
      btn.innerHTML = '<i class="fa-solid fa-circle-play fa-bounce"></i>';
    }
  };

  const modal = (img) => {
    document.getElementById("show-modal-image").src = img.src;
    new bootstrap.Modal("#modal-image").show();
  };

  const tamu = () => {
    let name = new URLSearchParams(window.location.search).get("to");

    if (!name) {
      document.getElementById("nama-tamu").remove();
      return;
    }

    let div = document.createElement("div");
    div.classList.add("m-2");
    div.innerHTML = `<p class="mt-0 mb-1 mx-0 p-0 text-light">Kepada Yth Bapak/Ibu/Saudara/i</p><h2 class="text-light">${escapeHtml(
      name
    )}</h2>`;

    document.getElementById("form-nama").value = name;
    document.getElementById("nama-tamu").appendChild(div);
  };

  const buka = async () => {
    document.querySelector("body").style.overflowY = "scroll";
    AOS.init();
    audio.play();

    opacity("welcome");
    document.getElementById("tombol-musik").style.display = "block";
    timer();
    await session.check();
  };

  return {
    buka: buka,
    tamu: tamu,
    modal: modal,
    play: play,
    salin: salin,
    escapeHtml: escapeHtml,
    opacity: opacity,
  };
})();

const progress = (() => {
  const assets = document.querySelectorAll("img");
  const info = document.getElementById("progress-info");
  const bar = document.getElementById("bar");

  let total = assets.length;
  let loaded = 0;

  const progress = () => {
    loaded += 1;

    bar.style.width = Math.min((loaded / total) * 100, 100).toString() + "%";
    info.innerText = `Loading assets (${loaded}/${total}) [${parseInt(
      bar.style.width
    ).toFixed(0)}%]`;

    if (loaded == total) {
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
      }

      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      window.scrollTo(0, 0);

      util.tamu();
      util.opacity("loading");
    }
  };

  assets.forEach((asset) => {
    if (asset.complete && asset.naturalWidth !== 0) {
      progress();
    } else {
      asset.addEventListener("load", () => {
        progress();
      });
    }
  });
})();

const audio = (() => {
  let audio = null;

  const singleton = () => {
    if (!audio) {
      audio = new Audio();
      audio.src = document
        .getElementById("tombol-musik")
        .getAttribute("data-url");
      audio.load();
      audio.currentTime = 0;
      audio.autoplay = true;
      audio.muted = false;
      audio.loop = true;
      audio.volume = 1;
    }

    return audio;
  };

  return {
    play: () => singleton().play(),
    pause: () => singleton().pause(),
  };
})();

const pagination = (() => {
  const perPage = 5;
  let pageNow = 0;
  let resultData = 0;

  const page = document.getElementById("page");
  const prev = document.getElementById("previous");
  const next = document.getElementById("next");

  const disabledPrevious = () => {
    prev.classList.add("disabled");
  };

  const disabledNext = () => {
    next.classList.add("disabled");
  };

  const buttonAction = async (button) => {
    let tmp = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Loading...`;
    await comment.ucapan();
    document
      .getElementById("daftar-ucapan")
      .scrollIntoView({ behavior: "smooth" });
    button.disabled = false;
    button.innerHTML = tmp;
  };

  return {
    getPer: () => {
      return perPage;
    },
    getNext: () => {
      return pageNow;
    },
    reset: async () => {
      pageNow = 0;
      resultData = 0;
      page.innerText = 1;
      next.classList.remove("disabled");
      await comment.ucapan();
      disabledPrevious();
    },
    setResultData: (len) => {
      resultData = len;
      if (resultData < perPage) {
        disabledNext();
      }
    },
    previous: async (button) => {
      if (pageNow < 0) {
        disabledPrevious();
      } else {
        pageNow -= perPage;
        disabledNext();
        await buttonAction(button);
        page.innerText = parseInt(page.innerText) - 1;
        next.classList.remove("disabled");
        if (pageNow <= 0) {
          disabledPrevious();
        }
      }
    },
    next: async (button) => {
      if (resultData < perPage) {
        disabledNext();
      } else {
        pageNow += perPage;
        disabledPrevious();
        await buttonAction(button);
        page.innerText = parseInt(page.innerText) + 1;
        prev.classList.remove("disabled");
      }
    },
  };
})();

const session = (() => {
  let body = document.querySelector("body");

  const login = async () => {
    await request("POST", "/api/session")
      .body({
        email: body.getAttribute("data-email"),
        password: body.getAttribute("data-password"),
      })
      .then((res) => {
        if (res.code == 200) {
          localStorage.removeItem("token");
          localStorage.setItem("token", res.data.token);
          comment.ucapan();
        }
      })
      .catch((err) => {
        alert(`Terdapat kesalahan: ${err}`);
        window.location.reload();
        return;
      });
  };

  const check = async () => {
    const token = localStorage.getItem("token");

    if (token) {
      const jwt = JSON.parse(atob(token.split(".")[1]));

      if (
        jwt.exp < new Date().getTime() / 1000 ||
        !jwt.iss.includes(new URL(window.location.href).host)
      ) {
        await login();
      } else {
        await comment.ucapan();
      }
    } else {
      await login();
    }
  };

  return { check };
})();

const like = (() => {
  const likes = storage("likes");

  const like = async (button) => {
    let token = localStorage.getItem("token");
    let id = button.getAttribute("data-uuid");

    if (!token) {
      alert("Terdapat kesalahan, token kosong !");
      window.location.reload();
      return;
    }

    let heart = button.firstElementChild.lastElementChild;
    let info = button.firstElementChild.firstElementChild;

    button.disabled = true;
    info.innerText = "Loading..";

    if (likes.has(id)) {
      await request("PATCH", "/api/comment/" + likes.get(id))
        .token(token)
        .then((res) => {
          if (res.data.status) {
            likes.unset(id);

            heart.classList.remove("fa-solid", "text-danger");
            heart.classList.add("fa-regular");

            info.setAttribute(
              "data-suka",
              (parseInt(info.getAttribute("data-suka")) - 1).toString()
            );
          }
        })
        .catch((err) => {
          alert(`Terdapat kesalahan: ${err}`);
        });
    } else {
      await request("POST", "/api/comment/" + id)
        .token(token)
        .then((res) => {
          if (res.code == 201) {
            likes.set(id, res.data.uuid);

            heart.classList.remove("fa-regular");
            heart.classList.add("fa-solid", "text-danger");

            info.setAttribute(
              "data-suka",
              (parseInt(info.getAttribute("data-suka")) + 1).toString()
            );
          }
        })
        .catch((err) => {
          alert(`Terdapat kesalahan: ${err}`);
        });
    }

    info.innerText = info.getAttribute("data-suka") + " suka";
    button.disabled = false;
  };

  return {
    like: like,
  };
})();

const comment = (() => {
  const kirim = document.getElementById("kirim");
  const hadiran = document.getElementById("form-kehadiran");
  const balas = document.getElementById("reply");
  const formnama = document.getElementById("form-nama");
  const formpesan = document.getElementById("form-pesan");
  const batal = document.getElementById("batal");
  const sunting = document.getElementById("ubah");

  const owns = storage("owns");
  const likes = storage("likes");

  let tempID = null;

  // OK
  const resetForm = () => {
    kirim.style.display = "block";
    hadiran.style.display = "block";

    batal.style.display = "none";
    balas.style.display = "none";
    sunting.style.display = "none";
    document.getElementById("label-kehadiran").style.display = "block";
    document.getElementById("balasan").innerHTML = null;

    formnama.value = null;
    hadiran.value = 0;
    formpesan.value = null;

    formnama.disabled = false;
    hadiran.disabled = false;
    formpesan.disabled = false;
  };

  // OK
  const send = async () => {
    let nama = formnama.value;
    let hadir = parseInt(hadiran.value);
    let komentar = formpesan.value;
    let token = localStorage.getItem("token") ?? "";

    if (token.length == 0) {
      alert("Terdapat kesalahan, token kosong !");
      window.location.reload();
      return;
    }

    if (nama.length == 0) {
      alert("nama tidak boleh kosong");
      return;
    }

    if (nama.length >= 35) {
      alert("panjangan nama maksimal 35");
      return;
    }

    if (hadir == 0) {
      alert("silahkan pilih kehadiran");
      return;
    }

    if (komentar.length == 0) {
      alert("pesan tidak boleh kosong");
      return;
    }

    formnama.disabled = true;
    hadiran.disabled = true;
    formpesan.disabled = true;
    kirim.disabled = true;

    let tmp = kirim.innerHTML;
    kirim.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Loading...`;

    let isSuccess = false;
    await request("POST", "/api/comment")
      .token(token)
      .body({
        nama: nama,
        hadir: hadir == 1,
        komentar: komentar,
      })
      .then((res) => {
        if (res.code == 201) {
          owns.set(res.data.uuid, res.data.own);
          isSuccess = true;
        }
      })
      .catch((err) => {
        alert(`Terdapat kesalahan: ${err}`);
      });

    if (isSuccess) {
      await pagination.reset();
      document
        .getElementById("daftar-ucapan")
        .scrollIntoView({ behavior: "smooth" });
      resetForm();
    }

    kirim.disabled = false;
    kirim.innerHTML = tmp;
    formnama.disabled = false;
    hadiran.disabled = false;
    formpesan.disabled = false;
  };

  // OK
  const balasan = async (button) => {
    button.disabled = true;
    let tmp = button.innerText;
    button.innerText = "Loading...";

    let id = button.getAttribute("data-uuid");
    let token = localStorage.getItem("token") ?? "";

    if (token.length == 0) {
      alert("Terdapat kesalahan, token kosong !");
      window.location.reload();
      return;
    }

    const BALAS = document.getElementById("balasan");
    BALAS.innerHTML = renderLoading(1);
    hadiran.style.display = "none";
    document.getElementById("label-kehadiran").style.display = "none";

    await request("GET", "/api/comment/" + id)
      .token(token)
      .then((res) => {
        if (res.code == 200) {
          kirim.style.display = "none";
          batal.style.display = "block";
          balas.style.display = "block";

          tempID = id;

          BALAS.innerHTML = `
                    <div class="my-3">
                        <h6>Balasan</h6>
                        <div id="id-balasan" data-uuid="${id}" class="card-body bg-light shadow p-3 rounded-4">
                            <div class="d-flex flex-wrap justify-content-between align-items-center">
                                <p class="text-dark text-truncate m-0 p-0" style="font-size: 0.95rem;">
                                    <strong>${util.escapeHtml(
                                      res.data.nama
                                    )}</strong>
                                </p>
                                <small class="text-dark m-0 p-0" style="font-size: 0.75rem;">${
                                  res.data.created_at
                                }</small>
                            </div>
                            <hr class="text-dark my-1">
                            <p class="text-dark m-0 p-0" style="white-space: pre-line">${util.escapeHtml(
                              res.data.komentar
                            )}</p>
                        </div>
                    </div>`;
        }
      })
      .catch((err) => {
        resetForm();
        alert(`Terdapat kesalahan: ${err}`);
      });

    document.getElementById("ucapan").scrollIntoView({ behavior: "smooth" });
    button.disabled = false;
    button.innerText = tmp;
  };

  // OK
  const innerComment = (data) => {
    return `
        <div class="d-flex flex-wrap justify-content-between align-items-center">
            <div class="d-flex flex-wrap justify-content-start align-items-center">
                <button style="font-size: 0.8rem;" onclick="comment.balasan(this)" data-uuid="${
                  data.uuid
                }" class="btn btn-sm btn-outline-dark rounded-3 py-0">Balas</button>
                ${
                  owns.has(data.uuid)
                    ? `
                <button style="font-size: 0.8rem;" onclick="comment.edit(this)" data-uuid="${data.uuid}" class="btn btn-sm btn-outline-dark rounded-3 py-0 ms-1">Ubah</button>
                <button style="font-size: 0.8rem;" onclick="comment.hapus(this)" data-uuid="${data.uuid}" class="btn btn-sm btn-outline-dark rounded-3 py-0 ms-1">Hapus</button>`
                    : ""
                }
            </div>
            <button style="font-size: 0.8rem;" onclick="like.like(this)" data-uuid="${
              data.uuid
            }" class="btn btn-sm btn-outline-dark rounded-2 py-0 px-0">
                <div class="d-flex justify-content-start align-items-center">
                    <p class="my-0 mx-1" data-suka="${data.like.love}">${
      data.like.love
    } suka</p>
                    <i class="py-1 me-1 p-0 ${
                      likes.has(data.uuid)
                        ? "fa-solid fa-heart text-danger"
                        : "fa-regular fa-heart"
                    }"></i>
                </div>
            </button>
        </div>
        ${innerCard(data.comments)}`;
  };

  // OK
  const innerCard = (comment) => {
    let result = "";

    comment.forEach((data) => {
      result += `
            <div class="card-body border-start bg-light py-2 ps-2 pe-0 my-2 ms-2 me-0" id="${
              data.uuid
            }">
                <div class="d-flex flex-wrap justify-content-between align-items-center">
                    <p class="text-dark text-truncate m-0 p-0" style="font-size: 0.95rem;">
                        <strong>${util.escapeHtml(data.nama)}</strong>
                    </p>
                    <small class="text-dark m-0 p-0" style="font-size: 0.75rem;">${
                      data.created_at
                    }</small>
                </div>
                <hr class="text-dark my-1">
                <p class="text-dark mt-0 mb-1 mx-0 p-0" style="white-space: pre-line">${util.escapeHtml(
                  data.komentar
                )}</p>
                ${innerComment(data)}
            </div>`;
    });

    return result;
  };

  // OK
  const renderCard = (data) => {
    const DIV = document.createElement("div");
    DIV.classList.add("mb-3");
    DIV.innerHTML = `
        <div class="card-body bg-light shadow p-3 m-0 rounded-4" data-parent="true" id="${
          data.uuid
        }">
            <div class="d-flex flex-wrap justify-content-between align-items-center">
                <p class="text-dark text-truncate m-0 p-0" style="font-size: 0.95rem;">
                    <strong class="me-1">${util.escapeHtml(
                      data.nama
                    )}</strong><i class="fa-solid ${
      data.hadir
        ? "fa-circle-check text-success"
        : "fa-circle-xmark text-danger"
    }"></i>
                </p>
                <small class="text-dark m-0 p-0" style="font-size: 0.75rem;">${
                  data.created_at
                }</small>
            </div>
            <hr class="text-dark my-1">
            <p class="text-dark mt-0 mb-1 mx-0 p-0" style="white-space: pre-line">${util.escapeHtml(
              data.komentar
            )}</p>
            ${innerComment(data)}
        </div>`;
    return DIV;
  };

  // OK
  const ucapan = async () => {
    const UCAPAN = document.getElementById("daftar-ucapan");
    UCAPAN.innerHTML = renderLoading(pagination.getPer());

    let token = localStorage.getItem("token") ?? "";
    if (token.length == 0) {
      alert("Terdapat kesalahan, token kosong !");
      window.location.reload();
      return;
    }

    await request(
      "GET",
      `/api/comment?per=${pagination.getPer()}&next=${pagination.getNext()}`
    )
      .token(token)
      .then((res) => {
        if (res.code == 200) {
          UCAPAN.innerHTML = null;
          res.data.forEach((data) => UCAPAN.appendChild(renderCard(data)));
          pagination.setResultData(res.data.length);

          if (res.data.length == 0) {
            UCAPAN.innerHTML = `<div class="h6 text-center">Tidak ada data</div>`;
          }
        }
      })
      .catch((err) => alert(`Terdapat kesalahan: ${err}`));
  };

  // OK
  const renderLoading = (num) => {
    let result = "";

    for (let index = 0; index < num; index++) {
      result += `
            <div class="mb-3">
                <div class="card-body bg-light shadow p-3 m-0 rounded-4">
                    <div class="d-flex flex-wrap justify-content-between align-items-center placeholder-glow">
                        <span class="placeholder bg-secondary col-5"></span>
                        <span class="placeholder bg-secondary col-3"></span>
                    </div>
                    <hr class="text-dark my-1">
                    <p class="card-text placeholder-glow">
                        <span class="placeholder bg-secondary col-6"></span>
                        <span class="placeholder bg-secondary col-5"></span>
                        <span class="placeholder bg-secondary col-12"></span>
                    </p>
                </div>
            </div>`;
    }

    return result;
  };

  // OK
  const reply = async () => {
    let nama = formnama.value;
    let komentar = formpesan.value;
    let token = localStorage.getItem("token") ?? "";
    let id = document.getElementById("id-balasan").getAttribute("data-uuid");

    if (token.length == 0) {
      alert("Terdapat kesalahan, token kosong !");
      window.location.reload();
      return;
    }

    if (nama.length == 0) {
      alert("nama tidak boleh kosong");
      return;
    }

    if (nama.length >= 35) {
      alert("panjangan nama maksimal 35");
      return;
    }

    if (komentar.length == 0) {
      alert("pesan tidak boleh kosong");
      return;
    }

    formnama.disabled = true;
    formpesan.disabled = true;

    batal.disabled = true;
    balas.disabled = true;
    let tmp = balas.innerHTML;
    balas.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Loading...`;

    let isSuccess = false;
    await request("POST", "/api/comment")
      .token(token)
      .body({
        nama: nama,
        id: id,
        komentar: komentar,
      })
      .then((res) => {
        if (res.code == 201) {
          isSuccess = true;
          owns.set(res.data.uuid, res.data.own);
        }
      })
      .catch((err) => {
        alert(`Terdapat kesalahan: ${err}`);
      });

    if (isSuccess) {
      await ucapan();
      document
        .getElementById(id)
        .scrollIntoView({ behavior: "smooth", block: "center" });
      resetForm();
    }

    batal.disabled = false;
    balas.disabled = false;
    balas.innerHTML = tmp;
    formnama.disabled = false;
    formpesan.disabled = false;
  };

  // OK
  const ubah = async () => {
    let token = localStorage.getItem("token") ?? "";
    let id = sunting.getAttribute("data-uuid");
    let hadir = hadiran.value;
    let komentar = formpesan.value;

    if (token.length == 0) {
      alert("Terdapat kesalahan, token kosong !");
      window.location.reload();
      return;
    }

    if (
      document.getElementById(id).getAttribute("data-parent") === "true" &&
      hadir == 0
    ) {
      alert("silahkan pilih kehadiran");
      return;
    }

    if (komentar.length == 0) {
      alert("pesan tidak boleh kosong");
      return;
    }

    hadiran.disabled = true;
    formpesan.disabled = true;

    sunting.disabled = true;
    batal.disabled = true;
    let tmp = sunting.innerHTML;
    sunting.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Loading...`;

    let isSuccess = false;
    await request("PUT", "/api/comment/" + owns.get(id))
      .body({
        hadir: parseInt(hadir) == 1,
        komentar: komentar,
      })
      .token(token)
      .then((res) => {
        if (res.data.status) {
          isSuccess = true;
        }
      })
      .catch((err) => {
        alert(`Terdapat kesalahan: ${err}`);
      });

    if (isSuccess) {
      await ucapan();
      document
        .getElementById(id)
        .scrollIntoView({ behavior: "smooth", block: "center" });
      resetForm();
    }

    sunting.innerHTML = tmp;
    sunting.disabled = false;
    batal.disabled = false;
    hadiran.disabled = false;
    formpesan.disabled = false;
  };

  // OK
  const hapus = async (button) => {
    if (!confirm("Kamu yakin ingin menghapus?")) {
      return;
    }

    let token = localStorage.getItem("token") ?? "";
    let id = button.getAttribute("data-uuid");

    if (token.length == 0) {
      alert("Terdapat kesalahan, token kosong !");
      window.location.reload();
      return;
    }

    button.disabled = true;
    let tmp = button.innerText;
    button.innerText = "Loading..";

    let isSuccess = false;
    await request("DELETE", "/api/comment/" + owns.get(id))
      .token(token)
      .then((res) => {
        if (res.data.status) {
          owns.unset(id);
          isSuccess = true;
        }
      })
      .catch((err) => {
        alert(`Terdapat kesalahan: ${err}`);
      });

    if (isSuccess) {
      ucapan();
    }

    button.innerText = tmp;
    button.disabled = false;
  };

  // OK
  const edit = async (button) => {
    button.disabled = true;
    let tmp = button.innerText;
    button.innerText = "Loading...";

    let id = button.getAttribute("data-uuid").toString();
    let token = localStorage.getItem("token") ?? "";

    if (token.length == 0) {
      alert("Terdapat kesalahan, token kosong !");
      window.location.reload();
      return;
    }

    await request("GET", "/api/comment/" + id)
      .token(token)
      .then((res) => {
        if (res.code == 200) {
          tempID = id;
          batal.style.display = "block";
          sunting.style.display = "block";
          kirim.style.display = "none";
          sunting.setAttribute("data-uuid", id);
          formpesan.value = res.data.komentar;
          formnama.value = res.data.nama;
          formnama.disabled = true;

          if (
            document.getElementById(id).getAttribute("data-parent") !== "true"
          ) {
            document.getElementById("label-kehadiran").style.display = "none";
            hadiran.style.display = "none";
          } else {
            hadiran.value = res.data.hadir ? 1 : 2;
            document.getElementById("label-kehadiran").style.display = "block";
            hadiran.style.display = "block";
          }

          document
            .getElementById("ucapan")
            .scrollIntoView({ behavior: "smooth" });
        }
      })
      .catch((err) => {
        alert(`Terdapat kesalahan: ${err}`);
      });

    button.disabled = false;
    button.innerText = tmp;
  };

  // OK
  return {
    ucapan: ucapan,
    kirim: send,
    renderLoading: renderLoading,

    hapus: hapus,
    edit: edit,
    ubah: ubah,

    balasan: balasan,
    reply: reply,
    batal: () => {
      if (tempID) {
        document
          .getElementById(tempID)
          .scrollIntoView({ behavior: "smooth", block: "center" });
        tempID = null;
      }

      resetForm();
    },
  };
})();

// bounce animation on navbar menu
const tombolNavbar = document.querySelectorAll(`.nav-link`);
window.onscroll = () => {
  tombolNavbar.forEach((navbar) => {
    if (navbar.classList.contains(`active`)) {
      navbar.classList.add(`fa-bounce`);
    } else {
      navbar.classList.remove(`fa-bounce`);
    }
  });
};

// cerita & galeri
const btnCeritaGaleri = document.querySelectorAll(`.btn-cerita-galeri`);
const htmlCeritaGaleri = document.querySelector(`.html-cerita-galeri`);
const galeriHTML = `<!--Galeri-->
<div
                id="carousel-foto-satu";
                data-aos="fade-up"
                data-aos-duration="1500"
                class="carousel slide carousel-fade"
                data-bs-ride="carousel"
              >
                <div class="carousel-indicators">
                  <button
                    type="button"
                    data-bs-target="#carousel-foto-satu"
                    data-bs-slide-to="0"
                    class="active"
                    aria-current="true"
                    aria-label="Slide 1"
                  ></button>
                  <button
                    type="button"
                    data-bs-target="#carousel-foto-satu"
                    data-bs-slide-to="1"
                    aria-label="Slide 2"
                  ></button>
                  <button
                    type="button"
                    data-bs-target="#carousel-foto-satu"
                    data-bs-slide-to="2"
                    aria-label="Slide 3"
                  ></button>
                  <button
                    type="button"
                    data-bs-target="#carousel-foto-satu"
                    data-bs-slide-to="3"
                    aria-label="Slide 4"
                  ></button>
                  <button
                    type="button"
                    data-bs-target="#carousel-foto-satu"
                    data-bs-slide-to="4"
                    aria-label="Slide 5"
                  ></button>
                  <button
                    type="button"
                    data-bs-target="#carousel-foto-satu"
                    data-bs-slide-to="5"
                    aria-label="Slide 6"
                  ></button>
                  <button
                    type="button"
                    data-bs-target="#carousel-foto-satu"
                    data-bs-slide-to="6"
                    aria-label="Slide 7"
                  ></button>
                </div>

                <div class="carousel-inner rounded-4">
                  <div class="carousel-item active">
                    <img
                      src="./assets/images/Galeri/BPP_5028.webp"
                      alt="gambar 1.1"
                      class="d-block w-100"
                      onclick="util.modal(this)"
                    />
                  </div>
                  <div class="carousel-item">
                    <img
                      src="./assets/images/Galeri/BPP_5049.webp"
                      alt="gambar 1.2"
                      class="d-block w-100"
                      onclick="util.modal(this)"
                    />
                  </div>
                  <div class="carousel-item">
                    <img
                      src="./assets/images/Galeri/BPP_5051.webp"
                      alt="gambar 1.3"
                      class="d-block w-100"
                      onclick="util.modal(this)"
                    />
                  </div>
                  <div class="carousel-item">
                    <img
                      src="./assets/images/Galeri/BPP_5058.webp"
                      alt="gambar 1.4"
                      class="d-block w-100"
                      onclick="util.modal(this)"
                    />
                  </div>
                  <div class="carousel-item">
                    <img
                      src="./assets/images/Galeri/BPP_5063.webp"
                      alt="gambar 1.5"
                      class="d-block w-100"
                      onclick="util.modal(this)"
                    />
                  </div>
                  <div class="carousel-item">
                    <img
                      src="./assets/images/Galeri/BPP_5090.webp"
                      alt="gambar 1.6"
                      class="d-block w-100"
                      onclick="util.modal(this)"
                    />
                  </div>
                  <div class="carousel-item">
                    <img
                      src="./assets/images/Galeri/BPP_5093.webp"
                      alt="gambar 1.7"
                      class="d-block w-100"
                      onclick="util.modal(this)"
                    />
                  </div>
                </div>

                <button
                  class="carousel-control-prev"
                  type="button"
                  data-bs-target="#carousel-foto-satu"
                  data-bs-slide="prev"
                >
                  <span
                    class="carousel-control-prev-icon"
                    aria-hidden="true"
                  ></span>
                  <span class="visually-hidden">Previous</span>
                </button>

                <button
                  class="carousel-control-next"
                  type="button"
                  data-bs-target="#carousel-foto-satu"
                  data-bs-slide="next"
                >
                  <span
                    class="carousel-control-next-icon"
                    aria-hidden="true"
                  ></span>
                  <span class="visually-hidden">Next</span>
                </button>
              </div>
              <div
                id="carousel-foto-dua"
                data-aos="fade-up"
                data-aos-duration="1500"
                class="carousel slide mt-4 carousel-fade"
                data-bs-ride="carousel"
              >
                <div class="carousel-indicators">
                  <button
                    type="button"
                    data-bs-target="#carousel-foto-dua"
                    data-bs-slide-to="0"
                    class="active"
                    aria-current="true"
                    aria-label="Slide 1"
                  ></button>
                  <button
                    type="button"
                    data-bs-target="#carousel-foto-dua"
                    data-bs-slide-to="1"
                    aria-label="Slide 2"
                  ></button>
                  <button
                    type="button"
                    data-bs-target="#carousel-foto-dua"
                    data-bs-slide-to="2"
                    aria-label="Slide 3"
                  ></button>
                  <button
                    type="button"
                    data-bs-target="#carousel-foto-dua"
                    data-bs-slide-to="3"
                    aria-label="Slide 4"
                  ></button>
                </div>

                <div class="carousel-inner rounded-4">
                  <div class="carousel-item active">
                    <img
                      src="./assets/images/Galeri/BPP_5033.webp"
                      alt="gambar 2.1"
                      class="d-block w-100"
                      onclick="util.modal(this)"
                    />
                  </div>
                  <div class="carousel-item">
                    <img
                      src="./assets/images/Galeri/BPP_5040.webp"
                      alt="gambar 2.2"
                      class="d-block w-100"
                      onclick="util.modal(this)"
                    />
                  </div>
                  <div class="carousel-item">
                    <img
                      src="./assets/images/Galeri/BPP_5077.webp"
                      alt="gambar 2.3"
                      class="d-block w-100"
                      onclick="util.modal(this)"
                    />
                  </div>
                  <div class="carousel-item">
                    <img
                      src="./assets/images/Galeri/BPP_5084.webp"
                      alt="gambar 2.4"
                      class="d-block w-100"
                      onclick="util.modal(this)"
                    />
                  </div>
                </div>

                <button
                  class="carousel-control-prev"
                  type="button"
                  data-bs-target="#carousel-foto-dua"
                  data-bs-slide="prev"
                >
                  <span
                    class="carousel-control-prev-icon"
                    aria-hidden="true"
                  ></span>
                  <span class="visually-hidden">Previous</span>
                </button>

                <button
                  class="carousel-control-next"
                  type="button"
                  data-bs-target="#carousel-foto-dua"
                  data-bs-slide="next"
                >
                  <span
                    class="carousel-control-next-icon"
                    aria-hidden="true"
                  ></span>
                  <span class="visually-hidden">Next</span>
                </button>
              </div>`;
const kisahHTML = `<!--Kisah Cinta  -->
              <div
                id="carouselExampleCaptions"
                class="carousel slide"
                data-aos="fade-up"
                data-aos-duration="1500"
                data-bs-ride="carousel"
              >
                <div class="carousel-indicators mb-0 mt5">
                  <button
                    type="button"
                    data-bs-target="#carouselExampleCaptions"
                    data-bs-slide-to="0"
                    class="active"
                    aria-current="true"
                    aria-label="Slide 1"
                  ></button>
                  <button
                    type="button"
                    data-bs-target="#carouselExampleCaptions"
                    data-bs-slide-to="1"
                    aria-label="Slide 2"
                  ></button>
                  <button
                    type="button"
                    data-bs-target="#carouselExampleCaptions"
                    data-bs-slide-to="2"
                    aria-label="Slide 3"
                  ></button>
                  <button
                    type="button"
                    data-bs-target="#carouselExampleCaptions"
                    data-bs-slide-to="3"
                    aria-label="Slide 4"
                  ></button>
                  <button
                    type="button"
                    data-bs-target="#carouselExampleCaptions"
                    data-bs-slide-to="4"
                    aria-label="Slide 5"
                  ></button>
                </div>
                <div class="carousel-inner rounded-4">
                  <div class="carousel-item active">
                    <img
                      src="./assets/images/Galeri/BPP_5084.webp"
                      class="d-block w-100"
                      alt="..."
                      onclick="util.modal(this)"
                    />
                    <div class=" d-md-block">
                      <h5>2014</h5>
                      <p>
                        Kami pertama kali dipertemukan di SMA dan memulai kisah kami disana.
                      </p>
                    </div>
                  </div>
                  <div class="carousel-item">
                    <img
                      src="./assets/images/Galeri/BPP_5077.webp"
                      class="d-block w-100"
                      alt="..."
                      onclick="util.modal(this)"
                    />
                    <div class=" d-md-block">
                      <h5>2014-2016</h5>
                      <p>
                        Pada tanggal 16 Juni 2014 Kami berkomitmen dan menjalani masa putih abu abu bersama dengan suka dan duka yang menyertai.
                      </p>
                    </div>
                  </div>
                  <div class="carousel-item">
                    <img
                      src="./assets/images/Galeri/BPP_5033.webp"
                      class="d-block w-100"
                      alt="..."
                      onclick="util.modal(this)"
                    />
                    <div class=" d-md-block">
                      <h5>2016-2021</h5>
                      <p>
                        Kami menjalani studi diperguruan tinggi yang sama, banyak kenangan indah dan pelajaran yang dapat kami petik untuk memperkuat komitmen kami
                      </p>
                    </div>
                  </div>
                  <div class="carousel-item">
                    <img
                      src="./assets/images/Galeri/BPP_5031.webp"
                      class="d-block w-100"
                      alt="..."
                      onclick="util.modal(this)"
                    />
                    <div class=" d-md-block">
                      <h5>2021-2023</h5>
                      <p>
                        Setelah selesai menjalani studi, kami pun mulai menyusun rencana serta berangan angan untuk menyatukan tujuan bersama dan pada bulan Juni 2023 memantapkan hati untuk mempertemukan kedua keluarga
                      </p>
                    </div>
                  </div>
                  <div class="carousel-item">
                    <img
                      src="./assets/images/Galeri/BPP_5033.webp"
                      class="d-block w-100"
                      alt="..."
                      onclick="util.modal(this)"
                    />
                    <div class=" d-md-block">
                      <h5>2024</h5>
                      <p>
                        Alhamdulillah, pada tanggal 3 bulan 3, 2024, setelah kami menjalani hampir 10 tahun kisah cinta, kami akan melangsungkan pernikahan dan membagikan kebahagiaan pada semua rekan dan saudara yang dapat hadir maupun tidak di acara kami. mohon doa restu agar menjadi pasangan yang sakinah mawaddah warahmah. terimakasih ❤️
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  class="carousel-control-prev"
                  type="button"
                  data-bs-target="#carouselExampleCaptions"
                  data-bs-slide="prev"
                >
                  <span
                    class="carousel-control-prev-icon"
                    aria-hidden="true"
                  ></span>
                  <span class="visually-hidden">Previous</span>
                </button>
                <button
                  class="carousel-control-next"
                  type="button"
                  data-bs-target="#carouselExampleCaptions"
                  data-bs-slide="next"
                >
                  <span
                    class="carousel-control-next-icon"
                    aria-hidden="true"
                  ></span>
                  <span class="visually-hidden">Next</span>
                </button>
              </div>`;
const renderCurrent = () => {
  const text = document.querySelector(`.text-cerita-galeri`);
  if (text.innerHTML) {
    htmlCeritaGaleri.innerHTML = galeriHTML;
  } else {
    htmlCeritaGaleri.innerHTML = kisahHTML;
  }
};
renderCurrent();

// ganti cerita atau galeri
btnCeritaGaleri.forEach((tombol) =>
  tombol.addEventListener("click", () => {
    const textCeritaGaleri = document.querySelector(`.text-cerita-galeri`);
    const text = textCeritaGaleri.innerText;
    if (text === `Galeri `) {
      textCeritaGaleri.innerText = `Kisah Cinta`;
      htmlCeritaGaleri.innerHTML = kisahHTML;
    } else if (text === `Kisah Cinta`) {
      textCeritaGaleri.innerText = `Galeri `;
      htmlCeritaGaleri.innerHTML = galeriHTML;
    }
  })
);
