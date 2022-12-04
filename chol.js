function chol(A){
    if(A instanceof Array && A[0] instanceof Array && typeof(A[0][0]) =="number"){
        if (A.length ==2 && A[0].length ==2){
            // let R = [[a,b],[0,c]]; R^T*R =A = [[a^2, ab],[ab, b^2+c^2]]
            if (A[0][0]<0){
                console.error("cholesky failed"); 
                return -1;
            }else if(A[0][0]==0){
                return [[0,0],[0,Math.sqrt(A[1][1])]]
            }
            let a = Math.sqrt(A[0][0]);
            let b = A[0][1]/a;
            let c2 = A[1][1] - b**2;
            if(c2<0){ 
                console.error("cholesky failed"); 
                return -1;
            }
            let c = Math.sqrt(c2)
            let R=[[a,b],[0,c]];
            return R;
        }
        console.error("chol() not implemented for >2 matrix sizes")
        return -1;
    }
    console.error("A should be a regular matrix for chol() to work")
    return -1;
}