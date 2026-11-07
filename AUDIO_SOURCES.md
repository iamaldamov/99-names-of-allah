# Audio sources and attribution

The individual pronunciation MP3 files are provided by the open-source Flutter package **esmaulhusna_muslimbg**.

- Project: https://github.com/cemalkarabulakli/esmaulhusna_muslimbg
- Package: https://pub.dev/packages/esmaulhusna_muslimbg
- Audio directory: https://github.com/cemalkarabulakli/esmaulhusna_muslimbg/tree/f1dddc8592281fb45a3bd4bcdc51a27f9ff9d485/esmaulhusna_muslimbg/lib/assets/audio
- Source revision: `f1dddc8592281fb45a3bd4bcdc51a27f9ff9d485`
- License: MIT (copyright © 2024 Cemal Karabulaklı). The source repository's LICENSE file applies to the package files.

The upstream package contains 99 separate clips. Its ordering includes **Al-Ahad** after **Al-Wahid**, while this app's 99-item study list does not include Al-Ahad and uses a different final entry (**Allah**). The mapping in `src/data/pronunciationAudio.ts` accounts for this difference; it does not silently shift the clips. The source package does not provide a separate clip for the app's final **Allah** entry, so the app displays that recording as unavailable rather than generating speech.

**Accuracy note:** the package documents these as pronunciation audio assets, but it does not identify the reciter or provide evidence of review by a qualified Arabic teacher. The app therefore does not describe the recordings as Ijazah-certified or teacher-verified. Please have a qualified Arabic teacher review the recordings before presenting them as certified learning material.

MIT License notice from the source package:

MIT License

Copyright (c) 2024 Cemal Karabulaklı

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

