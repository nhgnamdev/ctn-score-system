window.UI={
 toast(msg,icon='success'){if(window.Swal)Swal.fire({toast:true,position:'top-end',showConfirmButton:false,timer:1700,icon,title:msg});else alert(msg);},
 esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));},
 badge(text,kind='slate'){const m={blue:'bg-blue-50 text-blue-700',green:'bg-emerald-50 text-emerald-700',red:'bg-red-50 text-red-700',amber:'bg-amber-50 text-amber-700',purple:'bg-purple-50 text-purple-700',slate:'bg-slate-100 text-slate-600'};return `<span class="px-2 py-1 rounded-full text-xs font-bold ${m[kind]||m.slate}">${this.esc(text)}</span>`;}
};
