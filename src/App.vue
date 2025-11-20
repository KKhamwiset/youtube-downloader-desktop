<script setup>
import { nextTick, ref, watch, computed } from 'vue';

const url = ref('');
const status = ref('');
const inputRef = ref(null);
const format = ref('mp3');
const isDownloading = ref(false);
const progress = ref(0);

// --- 1. VALIDATION LOGIC ---
const isValidUrl = computed(() => {
  if (!url.value) return true; 
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return pattern.test(url.value);
});

const history = ref(JSON.parse(localStorage.getItem('downloadHistory') || '[]'));

watch(history, (newHistory) => {
  localStorage.setItem('downloadHistory', JSON.stringify(newHistory));
}, { deep: true });

const handleReset = async () => {
  url.value = "";
  status.value = "";
  await nextTick();
  inputRef.value?.focus();
}

const clearHistory = () => {
  if(confirm('Clear all download history?')) history.value = [];
}

const removeHistoryItem = (index) => {
  history.value.splice(index, 1);
}

const handleDownload = async () => {
  if (!url.value.trim()) {
    status.value = 'Please enter a URL.';
    return;
  }
  if (!isValidUrl.value) {
    status.value = 'ลิงก์ไม่ถูกต้อง (Invalid URL)';
    return;
  }
  
  isDownloading.value = true;
  status.value = 'Initializing...';
  progress.value = 0;

  const interval = setInterval(() => {
    if (progress.value < 90) progress.value += Math.random() * 5;
  }, 500);

  try {
    if (typeof window.electron?.downloadMedia !== 'function') {
      throw new Error('Electron API missing');
    }

    const res = await window.electron.downloadMedia(url.value.trim(), format.value);
    clearInterval(interval);
    progress.value = 100;
    
    if (res.ok) {
      status.value = 'Download Complete!';
      history.value.unshift({
        id: Date.now(),
        title: res.title || url.value,    
        path: res.path || 'Saved to Disk',
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      });

      setTimeout(() => {
        isDownloading.value = false;
        progress.value = 0;
        handleReset();
      }, 2000);
    } else {
      throw new Error(res.error || res.message);
    }

  } catch (err) {
    clearInterval(interval);
    isDownloading.value = false;
    progress.value = 0;
    console.error(err);
    status.value = 'Error: ' + (err?.message || 'unknown');
  }
};
</script>

<template>
  <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
  <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600&display=swap" rel="stylesheet">

  <div class="min-h-screen bg-linear-to-r from-gray-950 via-[#1a1a1a] to-black flex items-center justify-center p-4 text-base-content font-kanit">
    
    <div class="card w-full max-w-5xl min-h-[650px] bg-[#121212]/80 backdrop-blur-xl shadow-[0_0_40px_-10px_rgba(220,38,38,0.3)] border border-white/10 overflow-hidden flex flex-row">
      
      <div class="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-red-600 to-red-900 z-10"></div>

      <div class="w-5/12 p-8 flex flex-col gap-6 border-r border-white/10 pt-10">
        
        <div class="flex flex-col items-center text-center space-y-2">
          <div class="p-4 rounded-full bg-linear-to-r from-red-500/20 to-transparent border border-red-500/20 mb-2 shadow-inner">
            <i class='bx bxs-music text-4xl text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]'></i>
          </div>
          <div>
            <h2 class="card-title text-2xl font-bold text-white tracking-tight">YT Downloader</h2>
          </div>
        </div>

        <div class="form-control w-full mt-4 animate-pop-in" style="animation-delay: 0.1s;">
          <label class="label pb-1">
            <span class="label-text text-gray-400 text-xs font-bold uppercase">Link ของวิดีโอ youtube</span>
            <span v-if="url && !isValidUrl" class="text-red-500 text-[10px] font-bold uppercase animate-pulse">Invalid URL</span>
          </label>
          <div class="relative group">
            <span class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none transition-colors"
                 :class="isValidUrl ? 'text-gray-500 group-focus-within:text-red-500' : 'text-red-500'">
              <i class='bx bx-link text-xl'></i>
            </span>
            <input
              ref="inputRef"
              v-model="url"
              :disabled="isDownloading"
              type="text"
              placeholder="Paste YouTube link..."
              :class="{'input-error border-red-500 text-red-200 focus:border-red-500 focus:ring-red-500' : !isValidUrl && url}"
              class="input input-bordered w-full pl-11 bg-black/50 border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all h-12 text-sm placeholder:text-gray-600 disabled:opacity-50 font-kanit tracking-wide"
            />
          </div>
        </div>

        <div v-if="isDownloading" class="w-full space-y-1 animate-pop-in">
          <div class="flex justify-between text-[10px] uppercase font-bold text-red-500">
            <span>Processing</span>
            <span>{{ Math.round(progress) }}%</span>
          </div>
          <progress class="progress progress-error w-full h-2" :value="progress" max="100"></progress>
        </div>

        <div class="form-control w-full animate-pop-in" style="animation-delay: 0.2s;">
          <label class="label pb-2">
            <span class="label-text text-gray-400 text-xs font-bold uppercase">Format</span>
          </label>
          
          <div class="relative">
            <i :class="`bx ${format === 'mp3' ? 'bxs-music' : 'bxs-video'} absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl z-10`"></i>
            
            <select v-model="format" 
            class="select select-bordered w-full pl-12 bg-black border-white/10 focus:border-red-500 text-sm appearance-none cursor-pointer hover:bg-black/70 transition-colors font-kanit">
              <option value="mp3" class="bg-[#1a1a1a] text-gray-200 py-2">ไฟล์เสียง (.mp3)</option>
              <option value="mp4" class="bg-[#1a1a1a] text-gray-200 py-2">ไฟล์วิดีโอ (.mp4)</option>
            </select>
            
            <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <i class='bx bxs-chevron-down'></i>
            </div>
          </div>
        </div>

        <div class="flex flex-row gap-2 mt-2 animate-pop-in" style="animation-delay: 0.3s;">
          <button 
            @click="handleDownload" 
            :disabled="isDownloading || (url && !isValidUrl)"
            class="btn btn-error flex-1 h-12 text-white shadow-lg shadow-red-900/20 hover:shadow-red-600/40 border-none bg-linear-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 transition-all duration-300 group disabled:opacity-50 font-kanit font-bold text-lg"
          >
            <span class="tracking-wide">{{ isDownloading ? 'Wait...' : 'Download' }}</span>
            <i v-if="!isDownloading" class='bx bxs-download text-xl group-hover:animate-bounce ml-2'></i>
            <span v-else class="loading loading-spinner loading-sm ml-2"></span>
          </button>
          <button 
            @click="handleReset" 
            :disabled="isDownloading"
            class="btn btn-outline w-16 h-12 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 border-white/20"
          >
            <i class='bx bx-reset text-2xl'></i>
          </button>
        </div>

        <div class="mt-auto">
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="translate-y-1 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="translate-y-1 opacity-0"
          >
            <div v-if="status" 
              class="alert flex items-start text-sm shadow-lg border border-opacity-20 rounded-lg p-3 font-kanit"
              :class="{
                'alert-success bg-emerald-900/30 border-emerald-500 text-emerald-200': status.includes('Complete'),
                'alert-error bg-red-900/30 border-red-500 text-red-200': status.includes('Error') || status.includes('failed') || status.includes('Invalid'),
                'alert-info bg-blue-900/30 border-blue-500 text-blue-200': !status.includes('Error') && !status.includes('Complete') && !status.includes('Invalid')
              }"
            >
              <span class="font-medium ml-1 wrap-break-words text-xs">{{ status }}</span>
            </div>
          </Transition>
        </div>
      </div>

      <div class="w-7/12 bg-black/20 flex flex-col pt-10">
        <div class="px-6 pb-4 border-b border-white/5 flex justify-between items-end">
          <h3 class="text-gray-300 font-bold flex items-center gap-2 text-sm uppercase tracking-wider font-kanit">
            <i class='bx bx-history text-red-500'></i> History
          </h3>
          <button v-if="history.length" @click="clearHistory" class="text-[10px] text-red-500 hover:text-white transition-colors underline font-kanit">
            CLEAR ALL
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          <div v-if="history.length === 0" class="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
            <i class='bx bx-library text-5xl mb-2'></i>
            <span class="text-xs uppercase font-bold font-kanit">No Downloads Yet</span>
          </div>
          
          <div 
            v-for="(item, index) in history" 
            :key="item.id"
            class="group p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-red-500/30 transition-all duration-200 flex gap-3 items-start relative animate-pop-in"
          >
            <div class="mt-1 min-w-8 h-8 rounded bg-black/50 flex items-center justify-center text-red-500 border border-white/5">
              <i class='bx bxs-music'></i>
            </div>
            <div class="flex-1 min-w-0 flex flex-col gap-1">
              <div class="font-bold text-gray-200 text-sm truncate pr-6 font-kanit" :title="item.title">
                {{ item.title }}
              </div>
              <div class="flex flex-col text-[10px] text-gray-500 font-mono">
                <span class="flex items-center gap-1 truncate text-gray-400" :title="item.path">
                  <i class='bx bxs-folder-open'></i> {{ item.path }}
                </span>
                <span class="text-gray-600 mt-1">{{ item.time }}</span>
              </div>
            </div>
            <button @click="removeHistoryItem(index)" class="absolute top-3 right-3 text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
              <i class='bx bx-x text-lg'></i>
            </button>
          </div>
        </div>
        <div class="p-2 bg-black/40 text-center border-t border-white/5">
          <p class="text-[10px] text-gray-600 font-kanit">Files saved to Downloads folder</p>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* NEW: Import Kanit Font for the whole App */
.font-kanit {
  font-family: 'Kanit', sans-serif;
}

/* NEW: Keyframe Animation */
@keyframes popIn {
  0% { opacity: 0; transform: translateY(10px) scale(0.98); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

/* Utility class to apply the animation */
.animate-pop-in {
  animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0; /* Start invisible */
}

.card { -webkit-font-smoothing: antialiased; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ef4444; }
select { -webkit-appearance: none; -moz-appearance: none; appearance: none; }
</style>