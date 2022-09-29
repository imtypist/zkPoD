import hashlib
import os
import time
import linecache
from zokrates_pycrypto.eddsa import PrivateKey, PublicKey
from zokrates_pycrypto.field import FQ

def generate_inputs(data_len):
    # Seeded for debug purpose
    key = FQ(1997011358982923168928344992199991480689546837621580239342656433234255379025)
    sk = PrivateKey(key)

    pk = PublicKey.from_private(sk)

    inputs = [i for i in range(data_len)]

    keys = [pk.p.x.n, pk.p.y.n, sk.fe.n]
    # Fix the hash of the last block to 0x00000000000000010000000200000003000000040000000500000006...(512 bits) for debug purpose
    args = " ".join(map(str, keys)) + " " + " ".join(map(str, inputs)) + " 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15"
    return args


def micro_test(OD_NAME, data_len, path):
    # replace DATA_LEN
    window_size = 4
    profile_len = data_len - window_size + 1
    with open(OD_NAME + "_template.zok", "r") as f:
        data = f.read().replace("DATA_LEN", str(data_len)).replace("WINDOW_SIZE", str(window_size)).replace("PROFILE_LEN", str(profile_len))
        with open(path + OD_NAME + ".zok", "w+") as file:
            file.write(data)

    print("data length: %s" % data_len)

    # compile circuit
    os.system("cd " + path + " && zokrates compile -i " + OD_NAME + ".zok -o " + OD_NAME + " > compile.out")
    linecache.updatecache(path + "compile.out")
    constraints = linecache.getline(path + "compile.out", 4).split(":")[1].strip()
    print("# of constraints: %s" % constraints)

    # GenParam
    st = time.perf_counter()
    os.system("cd " + path + " && zokrates setup -i " + OD_NAME + " > setup.out")
    ed = time.perf_counter()
    genparam = (ed - st) * 1000
    print("GenParam: %s ms" % genparam)

    # ProveData
    args = generate_inputs(data_len)
    st = time.perf_counter()
    os.system("cd " + path + " && zokrates compute-witness -i " + OD_NAME + " -a " + args + " > witness.out && zokrates generate-proof -i " + OD_NAME + " > proof.out")
    ed = time.perf_counter()
    provedata = (ed - st) * 1000
    print("ProveData: %s ms" % provedata)

    # VerifyProof
    verifyproof = float("inf")
    for i in range(5):
        st = time.perf_counter()
        os.system("cd " + path + " && zokrates verify > verify.out")
        # 512bits -> 64 bytes, simulate the operation of calculating hash of the last block, '8e6245e107a0127f17e480ba65f27e20ac48d13f15eedc93b716eb2806701f7d'
        sha2 = hashlib.sha256(b'0000000100020003000400050006000700080009001000110012001300140015').hexdigest()
        ed = time.perf_counter()
        if verifyproof > (ed - st) * 1000:
            verifyproof = (ed - st) * 1000
    print("VerifyProof: %s ms\n" % verifyproof)

    logs = [data_len, constraints, genparam, provedata, verifyproof]
    return ",".join(map(str, logs))


if __name__ == "__main__":
    OD_NAME = "IForest"
    f = open(OD_NAME + "_micro_test.csv", "w+")
    f.write("data_len,constraints,genparam,provedata,verifyproof\n")
    if not os.path.exists("build"):
        os.makedirs("build")
    for data_len in range(50, 351, 50):
        path = "./build/" + OD_NAME + "/" + str(data_len) + "/"
        if not os.path.exists(path):
            os.makedirs(path)
        f.write(micro_test(OD_NAME, data_len, path) + "\n")
    f.close()
    