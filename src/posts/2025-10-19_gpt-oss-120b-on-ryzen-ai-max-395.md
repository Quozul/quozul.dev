---
title: Running GPT-OSS 120b on AMD Ryzen AI Max+ 395
date: '2025-10-27'
tags: [ai, rocm, ryzen]
---

I just received my Framework Desktop Motherboard, equipped with the AMD Ryzen AI Max+ 395 and 128 GB of unified memory. Time to get the massive GPT-OSS model with 120 billion parameters running on this beast!

<!-- more -->

The plan is to use `llama.cpp` to run GPT-OSS 120b. But first, we need to get everything set up.

## Increasing VRAM Allocation

Before even installing the operating system, I increased the VRAM allocation from the default 0.5 GB to a whopping 96 GB, this can be done through the BIOS.

## Choosing a Distribution

For the operating system, I opted for Ubuntu Server 24.04.3, the latest version at the time of writing. While ROCm officially supports a few distributions, I chose Ubuntu because it’s the most widely used.

After installing the OS, make sure it’s up-to-date:
```shell
❯ sudo apt update
❯ sudo apt upgrade
```

## Upgrading the Kernel

The Ryzen AI Max+ 395 is officially supported starting with ROCm version 7.0.2. However, to run ROCm 7.0.2, we need kernel 6.14 or later.
Ubuntu 24.04 ships with kernel 6.8 by default, but we can easily upgrade to the Hardware Enablement (HWE) stack with a single command:
```shell
❯ sudo apt install --install-recommends linux-generic-hwe-24.04
```

## Installing ROCm

The following commands worked at the time of writing, but always check the sources below for the latest updates.

First, install the `amdgpu-install` utility:
```shell
❯ sudo apt update
❯ wget https://repo.radeon.com/amdgpu-install/7.0.2/ubuntu/noble/amdgpu-install_7.0.2.70002-1_all.deb
❯ sudo apt install ./amdgpu-install_7.0.2.70002-1_all.deb
```

Then, use the utility to install ROCm drivers with the appropriate use case:
```shell
❯ amdgpu-install -y --usecase=rocm --no-dkms
```

## Compiling Llama.cpp

Compiling `llama.cpp` on Ubuntu is straightforward, thanks to the official `amdgpu-install`. Just clone the repository and run the build command!

```shell
❯ git clone https://github.com/ggml-org/llama.cpp.git llama.cpp
❯ cd llama.cpp
❯ HIPCXX="$(hipconfig -l)/clang" HIP_PATH="$(hipconfig -R)" cmake -S . -B build -DGGML_HIP=ON -DAMDGPU_TARGETS=gfx1151 -DCMAKE_BUILD_TYPE=Release && cmake --build build --config Release -- -j $(nproc)
```

## Running the Model

Finally, start a server with the following command:
```shell
❯ ./build/bin/llama-server -hf ggml-org/gpt-oss-120b-GGUF -c 0 -fa on --jinja --no-mmap --n-gpu-layers 99
```

This will launch a server accessible on port 8080. If you're running on a local network, you may want to add `--host 0.0.0.0`.
I noticed the model loads very slowly, but adding `--no-mmap` significantly improved load times.
The `-c 0` flag ensures the model loads with its maximum context length of 128k tokens!

---

## Updating ROCm Drivers

ROCm 7.1.0 has been released not so long after the first write-up of this article, let's update it!

As stated in the official documentation, the recommended way to update ROCm drivers is to uninstall then reinstall the new version.

Start by uninstalling the drivers:
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

Re-compile llama.cpp with the updated drivers!

## Sources

- [Ubuntu kernel lifecycle and enablement stack](https://ubuntu.com/kernel/lifecycle)
- [Install Ryzen Software for Linux with ROCm](https://rocm.docs.amd.com/projects/radeon-ryzen/en/latest/docs/install/installryz/native_linux/install-ryzen.html)
- [Build llama.cpp locally on GitHub](https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md)
- [ggml-org/gpt-oss-120b-GGUF on Hugging Face](https://huggingface.co/ggml-org/gpt-oss-120b-GGUF)
