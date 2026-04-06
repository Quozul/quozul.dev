---
title: Running GPT-OSS 120b on AMD Ryzen AI Max+ 395
date: '2025-10-27'
tags: [ai, rocm, ryzen]
oldUrl:
  - /posts/2025-10-19-gpt-oss-120b-on-ryzen-ai-max-395/
---

Discover how I installed ROCm, compiled Llama.cpp and ran various AI models on my AMD Ryzen AI Max+ 395. I also cover some issues I encountered in this article.

<!-- more -->

I just received my Framework Desktop Motherboard, equipped with the AMD Ryzen AI Max+ 395 and 128 GB of unified memory. Time to get the massive GPT-OSS model with 120 billion parameters running on this beast!

The plan is to use `llama.cpp` to run GPT-OSS 120b. But first, we need to get everything set up.

## Preparation

### Allowing the GPU to use 116 GB of memory

#### Set VRAM to 512MB

1. Reboot your computer and enter the UEFI setup (F2 on the Framework Desktop)
2. Go to the "Advanced" tab and find the setting to modify the VRAM
3. Set VRAM size to "Auto (0.5 GB)"
4. Save and exit

The original guides recommends to disable IOMMU in the UEFI, however, the Framework Desktop does not seem to have this option.

#### Edit GRUB to add kernel boot options
Open a terminal and run:
```shell
sudo vim /etc/default/grub
```

Find the line:
```shell
GRUB_CMDLINE_LINUX_DEFAULT=""
```

Modify it to include:
```shell
GRUB_CMDLINE_LINUX_DEFAULT="amd_iommu=off amdgpu.gttsize=118784 ttm.pages_limit=33554432"
```

**Explanation of parameters:**
- `amd_iommu=off`: disables AMD IOMMU to reduce latency
- `amdgpu.gttsize=118784`: increases GTT memory size to 116 GB
- `ttm.pages_limit=33554432`: sets the page limit to support large memory pool

You can try and experiment with larger GTT sizes, however I encountered OOM issues when setting it to 128 GB.

[^1]: [AMD Ryzen AI Max 395: GTT Memory Step‐by‐Step Instructions (Ubuntu 24.04)](https://github.com/technigmaai/technigmaai-wiki/wiki/AMD-Ryzen-AI-Max--395:-GTT--Memory-Step%E2%80%90by%E2%80%90Step-Instructions-(Ubuntu-24.04))

### Choosing a Distribution

For the operating system, I opted for Ubuntu Server 24.04.3, the latest version at the time of writing. While ROCm officially supports a few distributions, I chose Ubuntu because it’s the most widely used.

After installing the OS, make sure it’s up-to-date:
```shell
❯ sudo apt update
❯ sudo apt upgrade
```

### Upgrading the Kernel

The Ryzen AI Max+ 395 is officially supported starting with ROCm version 7.0.2. However, to run ROCm 7.0.2, we need kernel 6.14 or later.
Ubuntu 24.04 ships with kernel 6.8 by default, but we can easily upgrade to the Hardware Enablement (HWE) stack with a single command[^2]:
```shell
❯ sudo apt install --install-recommends linux-generic-hwe-24.04
```

[^2]: [Ubuntu kernel lifecycle and enablement stack](https://ubuntu.com/kernel/lifecycle)

### Installing ROCm

The following commands worked at the time of writing, but always check the sources below for the latest updates.

First, install the `amdgpu-install` utility[^3]:
```shell
❯ sudo apt update
❯ wget https://repo.radeon.com/amdgpu-install/7.0.2/ubuntu/noble/amdgpu-install_7.0.2.70002-1_all.deb
❯ sudo apt install ./amdgpu-install_7.0.2.70002-1_all.deb
```

Then, use the utility to install ROCm drivers with the appropriate use case:
```shell
❯ amdgpu-install -y --usecase=rocm --no-dkms
```

[^3]: [Install Ryzen Software for Linux with ROCm](https://rocm.docs.amd.com/projects/radeon-ryzen/en/latest/docs/install/installryz/native_linux/install-ryzen.html)

## Compiling Llama.cpp

Compiling `llama.cpp` on Ubuntu is straightforward, thanks to the official `amdgpu-install`. Just clone the repository and run the build command! [^4]

```shell
❯ git clone https://github.com/ggml-org/llama.cpp.git llama.cpp
❯ cd llama.cpp
❯ HIPCXX="$(hipconfig -l)/clang" HIP_PATH="$(hipconfig -R)" cmake -S . -B build -DGGML_HIP=ON -DGGML_HIP_ROCWMMA_FATTN=ON -DGPU_TARGETS=gfx1151 -DCMAKE_BUILD_TYPE=Release
❯ cmake --build build --config Release -- -j $(nproc)
```

`gfx1151` is for the Ryzen AI Max+ 395. For the 7900XTX, you'll have to use `gfx1100` for instance.

[^4]: [Build llama.cpp locally on GitHub](https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md)

### Running the Model

Finally, start a server with the following command[^5]:
```shell
❯ ./build/bin/llama-server -hf ggml-org/gpt-oss-120b-GGUF -c 0 -fa on --jinja --no-mmap --n-gpu-layers 99
```

This will launch a server accessible on port 8080. If you're running on a local network, you may want to add `--host 0.0.0.0`.
I noticed the model loads very slowly, but adding `--no-mmap` significantly improved load times.
The `-c 0` flag ensures the model loads with its maximum context length of 128k tokens!

[^5]: [ggml-org/gpt-oss-120b-GGUF on Hugging Face](https://huggingface.co/ggml-org/gpt-oss-120b-GGUF)

### Benchmark

#### GPT-OSS-120b
Similarly to running the model, we must disable mmap when running a benchmark:
```shell
❯ ./build/bin/llama-bench -m ~/models/gpt-oss/gpt-oss-120b-mxfp4.gguf --mmap 0
```

Here are the results:
| model                          |       size |     params | backend    | ngl | mmap |            test |                  t/s |
| ------------------------------ | ---------: | ---------: | ---------- | --: | ---: | --------------: | -------------------: |
| gpt-oss 120B MXFP4 MoE         |  59.02 GiB |   116.83 B | ROCm       |  99 |    0 |           pp512 |        707.09 ± 2.01 |
| gpt-oss 120B MXFP4 MoE         |  59.02 GiB |   116.83 B | ROCm       |  99 |    0 |           tg128 |         50.20 ± 0.02 |


---

## Updating ROCm Drivers

### ROCm 7.1.0

ROCm 7.1.0 has been released not so long after the first write-up of this article, let's update it!

As stated in the official documentation, the recommended way to update ROCm drivers is to uninstall then reinstall the new version.

Start by uninstalling the drivers[^3]:
```shell
❯ sudo amdgpu-uninstall
```

Then reinstall the new version:
```shell
❯ sudo apt update
❯ wget https://repo.radeon.com/amdgpu-install/7.1/ubuntu/noble/amdgpu-install_7.1.70100-1_all.deb
❯ sudo apt install ./amdgpu-install_7.1.70100-1_all.deb
```

And finally, reinstall the new and updated ROCm drivers:
```shell
❯ amdgpu-install -y --usecase=rocm --no-dkms
```

**Bonus step:**

Re-compile llama.cpp with the updated drivers! You may have to delete the `build` directory.

### ROCm 7.2.0

ROCm 7.2.0 fixes some memory issues[^6]. It now requires the 6.14-1018 OEM kernel or newer:[^7]

```shell
❯ sudo apt update
❯ sudo apt install linux-oem-24.04c
```

Next, reboot the system to use the new kernel.

Same as previously, uninstall the current drivers and then reinstall the new version:

```shell
❯ sudo amdgpu-uninstall
❯ sudo apt update
❯ wget https://repo.radeon.com/amdgpu-install/7.2/ubuntu/noble/amdgpu-install_7.2.70200-1_all.deb
❯ sudo apt install ./amdgpu-install_7.2.70200-1_all.deb
❯ amdgpu-install -y --usecase=rocm --no-dkms
```

[^6]: [an illegal memory access was encountered](https://github.com/ROCm/ROCm/issues/5245)
[^7]: [amdgpu pagefault under rocm7.2 on gfx1151](https://github.com/ROCm/ROCm/issues/5890#issuecomment-3798635642)

## Troubleshooting

### Illegal memory access when running ComfyUI

Not really related to gpt-oss, but while on ROCm 7.1, I tried running ComfyUI. There I encountered some memory access issues. This issue was tracked on GitHub and is now resolved in ROCm 7.2[^6].

For full completeness, I'll include the workaround I used[^8]:

Adding this to `GRUB_CMDLINE_LINUX_DEFAULT` in `/etc/default/grub`:
```
amdgpu.cwsr_enable=0
```
and then running
```shell
❯ sudo update-grub
```

[^8]: [Comfyui Ksampler error](https://github.com/ROCm/TheRock/issues/1795#issuecomment-3519877539)

### Missing C++ Headers

If you encounter issues during the compilation of `llama.cpp`, such as missing standard C++ headers, here’s how to resolve them.

If you see an error like this during compilation:
```
Could not find standard C++ header 'cmath'. Add -v to your compilation command to check the include paths being searched. You may need to install the appropriate standard C++ library package corresponding to the search path.
```

Follow these steps to fix it[^9]:

1. First, check which version of GCC is being used by running:
   ```shell
   ❯ hipcc -v
   AMD clang version 20.0.0git (https://github.com/RadeonOpenCompute/llvm-project roc-7.1.0 25425 1b0eada6b0ee93e2e694c8c146d23fca90bc11c5)
   Target: x86_64-unknown-linux-gnu
   Thread model: posix
   InstalledDir: /opt/rocm-7.1.0/lib/llvm/bin
   Configuration file: /opt/rocm-7.1.0/lib/llvm/bin/clang++.cfg
   Found candidate GCC installation: /usr/lib/gcc/x86_64-linux-gnu/14
   Selected GCC installation: /usr/lib/gcc/x86_64-linux-gnu/14
   ```
   In this case, the output shows that GCC version 14 is being used.

2. Install the corresponding standard C++ library for the detected GCC version:
   ```shell
   ❯ sudo apt install libstdc++-14-dev
   ```
   Replace `14` with the appropriate version if necessary.

This should resolve the missing header issue and allow the compilation to proceed.

[^9]: [Installation troubleshooting](https://rocm.docs.amd.com/projects/install-on-linux/en/latest/reference/install-faq.html#issue-4-c-libraries)

### Improving Prompt Processing Speeds on ROCm 7.2

The workaround is to build llama.cpp with the `-DCMAKE_HIP_FLAGS="-mllvm --amdgpu-unroll-threshold-local=600"` flag to the cmake command[^10].

Here is the revised command to build llama.cpp:

```shell
❯ HIPCXX="$(hipconfig -l)/clang" HIP_PATH="$(hipconfig -R)" cmake -S . -B build -DGGML_HIP=ON -DGGML_HIP_ROCWMMA_FATTN=ON -DGPU_TARGETS=gfx1151 -DCMAKE_BUILD_TYPE=Release -DCMAKE_HIP_FLAGS="-mllvm --amdgpu-unroll-threshold-local=600"
❯ cmake --build build --config Release -- -j $(nproc)
```

This workaround should double or triple your prompt processing speeds in some cases.

[^10]: [ROCm is very sensitive to kernel version](https://github.com/kyuz0/amd-strix-halo-toolboxes/issues/45#issuecomment-3982761657)
